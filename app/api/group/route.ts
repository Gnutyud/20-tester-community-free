import { getGroups } from "@/data/group";
import { NextResponse } from "next/server";

export async function GET() {
  const groups = await getGroups();

  if (!groups) {
    return new NextResponse(null, { status: 500 });
  }

  return NextResponse.json(groups, { status: 200 });
}
