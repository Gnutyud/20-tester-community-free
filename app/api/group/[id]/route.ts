import { getGroupAppsAndRequests } from "@/data/app";
import { checkAndUpdateGroupStatus, getGroupById, joinGroup } from "@/data/group";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendNotiNewMemberJoin } from "@/lib/mail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const groupId = Number(params.id);
    const { appId } = await req.json();
    const user = await currentUser();

    if (!appId) {
      return new NextResponse("App ID missing", { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ meassage: "unauthorized" }, { status: 403 });
    }
    const userId = user?.id;
    // Check if the user is already a member of the group
    const existingGroupUser = await db.groupUser.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });

    if (existingGroupUser) {
      return NextResponse.json({ error: "User already joined this group!" }, { status: 400 });
    }

    const group = await getGroupById(groupId);

    // Add the user as a member of the group
    await db.groupUser.create({
      data: {
        user: { connect: { id: userId } },
        group: { connect: { id: groupId } },
      },
    });

    // Add the selected app to the group
    await joinGroup(appId, groupId);

    // Send notification to all members in the group about the new member
    if (user && group?.GroupUser) {
      const notificationMessage = `${user.name} has joined the group.`;
      for (const user of group.GroupUser) {
        // Create a notification for each user in the group
        await db.notification.create({
          data: {
            groupId: groupId,
            userId: user.user.id,
            title: "New member join!",
            message: notificationMessage,
          },
        });
      }
      // send email to all group members
      const memberEmailList = (group.GroupUser.map((groupUser) => groupUser.user.email || "") || []).toString();
      await sendNotiNewMemberJoin(memberEmailList, user?.name || user?.email || "");
    }

    // Check and update group status
    await checkAndUpdateGroupStatus(groupId);

    console.log("User joined the group successfully.");
    return NextResponse.json({ success: "User joined the group successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to join the group: ${error.message}`);
    throw error;
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser();
    const groupId = Number(params.id);
    const group = await getGroupById(groupId);
    const apps = await getGroupAppsAndRequests(groupId, user?.id || "");

    return NextResponse.json({...group, apps}, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to get group by ID: ${error.message}`);
    throw error;
  }
}
