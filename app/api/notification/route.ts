import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await updateLastActive(user.id!);

  const notifications = await db.notification.findMany({
    where: {
      userId: user.id,
      unread: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(notifications, { status: 200 });
}

export async function POST(request: Request) {
  const user = await currentUser();
  const body = await request.json();
  const { id } = body;
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await updateLastActive(user.id!);

  await db.notification.updateMany({
    where: { id, userId: user.id },
    data: {
      unread: false,
    },
  });

  return NextResponse.json(
    { success: "Update notification successfully!" },
    { status: 200 }
  );
}
