import { checkAndUpdateGroupStatus } from "@/data/group";
import { db } from "@/lib/db";
import { sendConfirmTesterEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { requestId, actionType, groupId } = body;
  if (!requestId || !actionType || !groupId) {
    return new NextResponse("Request ID, action type or groupId are missing", { status: 400 });
  }
  const request = await db.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: actionType,
    },
  });
  const requestUser = await db.user.findUnique({
    where: { id: request?.userId },
  });
  const approvalUser = await db.user.findUnique({
    where: { id: request?.userRequested },
  });
  // send email to the app owner
  if (requestUser?.email) {
    await sendConfirmTesterEmail(
      requestUser?.email,
      groupId,
      actionType,
      approvalUser?.name || "",
      approvalUser?.email || ""
    );
  }
  // Create a notification for each user in the group
  await db.notification.create({
    data: {
      groupId: groupId,
      userId: request?.userId,
      title: `Request to become a tester!`,
      message: `${approvalUser?.name || ""}<${approvalUser?.email}> ${actionType} that ${requestUser?.name || ""}<${
        requestUser?.email
      }> installed his app.`,
    },
  });

  // Check and update group status
  await checkAndUpdateGroupStatus(groupId);

  return NextResponse.json("Send success", { status: 200 });
}
