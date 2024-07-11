import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser(); // Assuming this function retrieves the current user
    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const apps = await db.app.findMany({
      where: { userId: user.id },
      include: {
        groupApps: {
          include: {
            group: true // Include all information about the associated groups
          }
        }
      }
    });

    return NextResponse.json(apps, { status: 200 });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
