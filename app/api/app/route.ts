import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  const apps = await db.app.findMany({
    where: { userId: user?.id },
    include: { groups: true}
  });

  return NextResponse.json(apps, { status: 200 });
}
