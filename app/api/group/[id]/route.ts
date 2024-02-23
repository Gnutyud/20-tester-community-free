import { checkAndUpdateGroupStatus, getGroupById } from "@/data/group";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const group = await getGroupById(Number(params.id));
  const user = await currentUser();

  if (!group && !user) {
    return new NextResponse(null, { status: 500 });
  }

  // Add the user to the group
  await db.groupUser.create({
    data: {
      user: { connect: { id: user?.id } },
      group: { connect: { id: group?.id } },
    },
  });

  // Check and update group status
  await checkAndUpdateGroupStatus(group?.id!);

  return NextResponse.json({ success: "Join a group success!" }, { status: 200 });
}
