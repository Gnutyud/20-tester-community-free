import { getGroups } from "@/data/group";
import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();
  if (user?.id) {
    await updateLastActive(user.id);
  }
  const groups = await getGroups();

  return NextResponse.json(groups, { status: 200 });
}
