import { getGroups } from "@/data/group";
import { db } from "@/lib/db";
import { sendRequestBecameTesterEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function GET() {
  const request = await db.request.findMany();

  return NextResponse.json(request, { status: 200 });
}

// Send a request confirmation became tester to the app owner
export async function POST(req: Request) {
  const body = await req.json();
  const { groupId, userId, appUserId, imageUrl } = body;
  const request = await db.request.create({
    data: {
      groupId,
      userId,
      // imageUrl,
      userRequested: appUserId, // ID of the user whose app is requested to be tested
      status: "PENDING", // Set the initial status to PENDING
    },
  });
  const requestUser = await db.user.findUnique({
    where: { id: userId },
  });
  const approvalUser = await db.user.findUnique({
    where: { id: appUserId },
  });
  // send email to the app owner
  if (approvalUser?.email) {
    await sendRequestBecameTesterEmail(approvalUser?.email, groupId, requestUser?.name || "");
  }
  // Create a notification for each user in the group
  await db.notification.create({
    data: {
      groupId: groupId,
      userId: appUserId,
      title: `Request to become a tester!`,
      message: `${requestUser?.name || ""}<${requestUser?.email}> just asked ${approvalUser?.name || ""}<${approvalUser?.email}> to confirm that he had installed the app.`,
    },
  });

  return NextResponse.json("Send success", { status: 200 });
}
