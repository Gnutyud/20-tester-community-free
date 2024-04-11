import { getGroups } from "@/data/group";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const request = await db.request.findMany();

  return NextResponse.json(request, { status: 200 });
}

// Send a request confirmation became tester to the app owner
export async function POST(req: Request) {
  const body = await req.json();
  const { groupId, userId, appUserId } = body;
  const request = await db.request.create({
    data: {
      groupId,
      userId,
      userRequested: appUserId, // ID of the user whose app is requested to be tested
      status: 'PENDING', // Set the initial status to PENDING
    },
  });
  // send email to the app owner

  return NextResponse.json('Send success', { status: 200 });
}
