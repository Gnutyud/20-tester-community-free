import { getGroups } from "@/data/group";
import { updateLastActive } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return Response.json({ message: "unauthorized" }, { status: 403 });
  }

  await updateLastActive(user.id!);

  const notifications = await db.notification.findMany({
    where: {
      userId: user.id,
      unread: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(notifications, { status: 200 });
}

export async function POST(request: Request) {
  const user = await currentUser();
  const body = await request.json();
  const { id } = body;
  if (!user) {
    return Response.json({ message: "unauthorized" }, { status: 403 });
  }
  const notification = await db.notification.update({
    where: { id },
    data: {
      unread: false,
    },
  });

  return Response.json(
    { success: "update notification successfully!" },
    { status: 200 }
  );
}
