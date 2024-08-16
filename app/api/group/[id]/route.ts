import { getAccountByUserId } from "@/data/account";
import { getGroupAppsAndRequests } from "@/data/app";
import {
  checkAndUpdateGroupStatus,
  getGroupById,
  joinGroup,
  leaveGroup,
} from "@/data/group";
import { getUserById, updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendNotiLeaveGroup, sendNotiNewMemberJoin } from "@/lib/mail";
import { GroupActions } from "@/types";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    const { action, appId, userId } = await req.json(); // `action` can be 'join' or 'leave'

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await updateLastActive(user.id!);

    const currentUserId = user?.id;
    const group = await getGroupById(groupId);

    if (action === GroupActions.JOIN) {
      if (!appId) {
        return NextResponse.json(
          { message: "App ID missing" },
          { status: 400 }
        );
      }

      // Check if the user is already a member of the group
      const existingGroupUser = await db.groupUser.findFirst({
        where: {
          userId: currentUserId,
          groupId: groupId,
        },
      });

      if (existingGroupUser) {
        return NextResponse.json(
          { error: "User already joined this group!" },
          { status: 400 }
        );
      }

      // Add user to the group
      await db.groupUser.create({
        data: {
          user: { connect: { id: currentUserId } },
          group: { connect: { id: groupId } },
        },
      });

      // Add app to the group
      await joinGroup(appId, groupId);

      // Send notification to all members
      if (group && group.groupUsers) {
        const notificationMessage = `${user.name} has joined the group.`;
        for (const groupUser of group.groupUsers) {
          await db.notification.create({
            data: {
              groupId: groupId,
              userId: groupUser.user.id,
              title: "New member joined!",
              message: notificationMessage,
            },
          });
        }
        // Send email to all group members
        const memberEmailList = group.groupUsers
          .map((groupUser) => groupUser.user.email || "")
          .toString();
        await sendNotiNewMemberJoin(
          memberEmailList,
          user?.name || user?.email || "",
          group.groupNumber
        );
      }

      // Check and update group status
      await checkAndUpdateGroupStatus(groupId);

      return NextResponse.json(
        { success: "User and app joined the group successfully!" },
        { status: 200 }
      );
    }

    if (action === GroupActions.LEAVE) {
      if (!appId) {
        return NextResponse.json(
          { message: "App ID missing" },
          { status: 400 }
        );
      }

      // Determine if this is a kick action (admin/group owner removing another user/app) or self-leave
      const targetUserId = userId || currentUserId; // If userId is provided, it's a kick; if not, it's self-leave
      const isKicking = userId && userId !== currentUserId; // Check if the user is trying to kick someone else

      // Ensure only admins or group owners can kick others
      if (isKicking) {
        const isAdmin = user.role === UserRole.ADMIN; // Replace this with your admin logic
        const isGroupOwner = await db.group.findFirst({
          where: {
            id: groupId,
            ownerId: currentUserId, // Check if current user is the group owner
          },
        });

        if (!isAdmin && !isGroupOwner) {
          return NextResponse.json(
            { message: "Not authorized to kick users" },
            { status: 403 }
          );
        }
      }

      // Remove the app and user from the group
      await leaveGroup(appId, groupId, targetUserId);

      // Check and update group status
      await checkAndUpdateGroupStatus(groupId);

      const targetUserInfo = await getUserById(targetUserId);

      // Send notification to all members
      if (group && group.groupUsers) {
        const notificationMessage = `${targetUserInfo?.name}<${
          targetUserInfo?.email
        }> has ${isKicking ? "been kicked from" : "left"} the group.`;
        for (const groupUser of group.groupUsers) {
          await db.notification.create({
            data: {
              groupId: groupId,
              userId: groupUser.user.id,
              title: isKicking ? "Member Kicked Out!" : "Member Left!",
              message:
                groupUser.userId === targetUserId
                  ? `You have been kicked from the Group#${group.groupNumber}`
                  : notificationMessage,
            },
          });
        }
        // Send email to all group members
        const memberEmailList = group.groupUsers
          .filter((user) => user.userId !== targetUserId)
          .map((groupUser) => groupUser.user.email || "")
          .toString();
        await sendNotiLeaveGroup(
          memberEmailList,
          `${targetUserInfo?.name}<${targetUserInfo?.email}>`,
          isKicking,
          group.groupNumber
        );
        await sendNotiLeaveGroup(
          group.groupUsers
            .filter((user) => user.userId === targetUserId)
            .map((groupUser) => groupUser.user.email || "")
            .toString(),
          "You",
          isKicking,
          group.groupNumber
        );
      }

      if (isKicking) {
        return NextResponse.json(
          { success: "User kicked from the group successfully!" },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: "User/app left the group successfully!" },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error(`Failed to handle group action: ${error.message}`);
    return NextResponse.json(
      { error: `Failed to handle group action: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    const groupId = params.id;
    const group = await getGroupById(groupId);
    const apps = await getGroupAppsAndRequests(groupId, user?.id || "");

    if (user?.id) {
      await updateLastActive(user.id);
    }

    return NextResponse.json({ ...group, apps }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to get group by ID: ${error.message}`);
    throw error;
  }
}
