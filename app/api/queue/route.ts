import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { processQueue } from "@/lib/matchmaking";
import { NextResponse } from "next/server";

const computeRemainingSlots = (target: number, fulfilled: number) =>
  Math.max(target - fulfilled, 0);

export async function GET() {
  const user = await currentUser();
  if (!user || !user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await updateLastActive(user.id);

  const queueEntries = await db.queueEntry.findMany({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    include: {
      app: {
        select: {
          id: true,
          appName: true,
          fulfilledTesterCount: true,
          targetTesterCount: true,
        },
      },
    },
  });

  return NextResponse.json(queueEntries, { status: 200 });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await updateLastActive(user.id);

  const body = await req.json();
  const { appId } = body ?? {};

  if (!appId) {
    return NextResponse.json({ message: "Missing appId" }, { status: 400 });
  }

  const app = await db.app.findUnique({
    where: { id: appId },
    select: {
      id: true,
      userId: true,
      targetTesterCount: true,
      fulfilledTesterCount: true,
    },
  });

  if (!app || app.userId !== user.id) {
    return NextResponse.json({ message: "App not found" }, { status: 404 });
  }

  const remainingSlots = computeRemainingSlots(
    app.targetTesterCount,
    app.fulfilledTesterCount
  );

  if (remainingSlots <= 0) {
    return NextResponse.json(
      { message: "This app already reached the tester goal" },
      { status: 400 }
    );
  }

  const existingEntry = await db.queueEntry.findUnique({
    where: { appId },
  });

  if (existingEntry) {
    await db.queueEntry.update({
      where: { id: existingEntry.id },
      data: {
        remainingSlots,
        joinedAt: new Date(),
        reminderStage: 0,
        lastReminderAt: null,
      },
    });
  } else {
    await db.queueEntry.create({
      data: {
        appId,
        userId: user.id,
        remainingSlots,
        reminderStage: 0,
        lastReminderAt: null,
      },
    });
  }

  await processQueue();

  return NextResponse.json(
    { success: "App added to the queue" },
    { status: 200 }
  );
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user || !user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await updateLastActive(user.id);

  const body = await req.json();
  const { appId } = body ?? {};

  if (!appId) {
    return NextResponse.json({ message: "Missing appId" }, { status: 400 });
  }

  await db.queueEntry.deleteMany({
    where: {
      appId,
      userId: user.id,
    },
  });

  return NextResponse.json(
    { success: "Queue entry removed" },
    { status: 200 }
  );
}

