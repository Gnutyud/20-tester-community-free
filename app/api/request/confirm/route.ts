import { checkAndUpdateGroupStatus } from "@/data/group";
import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendConfirmTesterEmail } from "@/lib/mail";
import { RequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const isFinalStatus = (value: unknown): value is Extract<RequestStatus, "ACCEPTED" | "REJECTED"> =>
  value === RequestStatus.ACCEPTED || value === RequestStatus.REJECTED;

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await updateLastActive(user.id!);

    const body = await req.json();
    const { requestId, actionType } = body ?? {};

    if (!requestId || !isFinalStatus(actionType)) {
      return NextResponse.json(
        { message: "Invalid request id or action type" },
        { status: 400 }
      );
    }

    const existingRequest = await db.request.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        groupId: true,
        userId: true,
        userRequested: true,
        status: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (existingRequest.userRequested !== user.id) {
      return NextResponse.json(
        { message: "Not allowed to confirm this request" },
        { status: 403 }
      );
    }

    if (existingRequest.status === actionType) {
      return NextResponse.json({ success: "Already updated" }, { status: 200 });
    }

    const participants = await db.user.findMany({
      where: {
        id: {
          in: [existingRequest.userId, existingRequest.userRequested],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const requesterProfile = participants.find(
      (participant) => participant.id === existingRequest.userId
    );
    const approverProfile = participants.find(
      (participant) => participant.id === existingRequest.userRequested
    );

    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: {
        status: actionType,
      },
      select: {
        id: true,
        status: true,
        groupId: true,
        userId: true,
        userRequested: true,
        updatedAt: true,
      },
    });

    const emailPromise = requesterProfile?.email
      ? sendConfirmTesterEmail(
          requesterProfile.email,
          existingRequest.groupId,
          actionType,
          approverProfile?.name || "",
          approverProfile?.email || ""
        )
      : Promise.resolve();

    await Promise.all([
      emailPromise,
      db.notification.create({
        data: {
          groupId: existingRequest.groupId,
          userId: existingRequest.userId,
          title: "Request to become a tester!",
          message: `${approverProfile?.name || ""}<${
            approverProfile?.email || ""
          }> ${actionType.toLowerCase()} that ${requesterProfile?.name || ""}<${
            requesterProfile?.email || ""
          }> installed the app.`,
        },
      }),
    ]);

    await checkAndUpdateGroupStatus(existingRequest.groupId);

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("Error confirming tester request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
