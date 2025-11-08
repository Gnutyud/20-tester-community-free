import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    await updateLastActive(user.id!);

    const apps = await db.app.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        appName: true,
        packageName: true,
        installUrl: true,
        googleGroupUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apps, { status: 200 });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
