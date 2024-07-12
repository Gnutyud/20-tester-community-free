import { getGroups } from "@/data/group";
import { NextResponse } from "next/server";

export async function POST() {
  const groups = await getGroups();

  return NextResponse.json(groups, { status: 200 });
}
