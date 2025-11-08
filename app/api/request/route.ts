import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendRequestBecameTesterEmail } from "@/lib/mail";
import { RequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const requestSelect = {
  id: true,
  groupId: true,
  userId: true,
  userRequested: true,
  status: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Record<string, boolean>;

const isRequestStatus = (value: unknown): value is RequestStatus =>
  typeof value === "string" &&
  Object.values(RequestStatus).includes(value as RequestStatus);

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requesterId = user.id as string;

    await updateLastActive(requesterId);

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const statusParam = searchParams.get("status");
    const statusFilter = isRequestStatus(statusParam) ? statusParam : undefined;

    const requests = await db.request.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        OR: [{ userId: requesterId }, { userRequested: requesterId }],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: requestSelect,
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Send a request confirmation became tester to the app owner
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requesterId = user.id as string;

    await updateLastActive(requesterId);

    const body = await req.json();
    const { groupId, userId, appUserId, imageUrl } = body ?? {};

    if (!groupId || !appUserId) {
      return NextResponse.json(
        { message: "Missing groupId or appUserId" },
        { status: 400 }
      );
    }

    if (userId && userId !== requesterId) {
      return NextResponse.json(
        { message: "Not allowed to create requests for another user" },
        { status: 403 }
      );
    }

    if (appUserId === requesterId) {
      return NextResponse.json(
        { message: "You cannot request yourself to become a tester" },
        { status: 400 }
      );
    }

    const participants = await db.user.findMany({
      where: {
        id: {
          in: [requesterId, appUserId],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const requesterProfile = participants.find(
      (participant) => participant.id === requesterId
    );
    const approverProfile = participants.find(
      (participant) => participant.id === appUserId
    );

    if (!approverProfile) {
      return NextResponse.json(
        { message: "App owner not found" },
        { status: 404 }
      );
    }

    const request = await db.request.create({
      data: {
        groupId,
        userId: requesterId,
        imageUrl: imageUrl ?? null,
        userRequested: appUserId,
        status: RequestStatus.PENDING,
      },
      select: requestSelect,
    });

    const emailPromise = approverProfile.email
      ? sendRequestBecameTesterEmail(
          approverProfile.email,
          groupId,
          requesterProfile?.name || requesterProfile?.email || "",
          imageUrl
        )
      : Promise.resolve();

    await Promise.all([
      emailPromise,
      db.notification.create({
        data: {
          groupId,
          userId: appUserId,
          title: "Request to become a tester!",
          message: `${requesterProfile?.name || ""}<${
            requesterProfile?.email || ""
          }> just asked ${approverProfile?.name || ""}<${
            approverProfile?.email || ""
          }> to confirm that they installed the app.`,
        },
      }),
    ]);

    return NextResponse.json(request, { status: 200 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Re-send a request confirmation became tester to the app owner
export async function PUT(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requesterId = user.id as string;

    await updateLastActive(requesterId);

    const body = await req.json();
    const { imageUrl, id } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { message: "Missing request id" },
        { status: 400 }
      );
    }

    const existingRequest = await db.request.findUnique({
      where: { id },
      select: requestSelect,
    });

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    if (existingRequest.userId !== requesterId) {
      return NextResponse.json(
        { message: "Not allowed to update this request" },
        { status: 403 }
      );
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
      where: { id },
      data: {
        imageUrl: imageUrl ?? null,
        status: RequestStatus.PENDING,
      },
      select: requestSelect,
    });

    const emailPromise = approverProfile?.email
      ? sendRequestBecameTesterEmail(
          approverProfile.email,
          existingRequest.groupId,
          requesterProfile?.name || requesterProfile?.email || "",
          imageUrl
        )
      : Promise.resolve();

    await Promise.all([
      emailPromise,
      db.notification.create({
        data: {
          groupId: existingRequest.groupId,
          userId: existingRequest.userRequested,
          title: "Request to become a tester!",
          message: `${requesterProfile?.name || ""}<${
            requesterProfile?.email || ""
          }> just asked ${approverProfile?.name || ""}<${
            approverProfile?.email || ""
          }> to confirm that they installed the app.`,
        },
      }),
    ]);

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
