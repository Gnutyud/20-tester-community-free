import { checkAndUpdateGroupStatus, getGroupById } from "@/data/group";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const groupId = Number(params.id);
    const user = await currentUser();
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

    // Add the user as a member of the group
    await db.groupUser.create({
      data: {
        user: { connect: { id: userId } },
        group: { connect: { id: groupId } },
      },
    });

    // Check and update group status
    await checkAndUpdateGroupStatus(groupId);

    console.log("User joined the group successfully.");
    return NextResponse.json({ success: "User joined the group successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to join the group: ${error.message}`);
    throw error;
  }
}
