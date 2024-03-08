import { getGroups } from "@/data/group";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return Response.json({ message: "unauthorized" }, { status: 403 });
  }
  const notifications = await db.notification.findMany({
    where: {
      userId: user.id,
    },
  });

  return Response.json(notifications, { status: 200 });
}
