import { db } from "@/lib/db";
import { RequestStatus } from "@prisma/client";

export const getGroupAppsAndRequests = async (
  groupId: string,
  userId: string
) => {
  try {
    const groupApps = await db.groupApps.findMany({
      where: {
        groupId,
      },
      include: {
        app: true,
      },
    });

    if (!groupApps.length) {
      return [];
    }

    if (!userId) {
      return groupApps.map(({ app }) => ({
        ...app,
        requestSent: false,
      }));
    }

    const appOwnerIds = groupApps.map(({ app }) => app.userId);

    const pendingRequests = await db.request.findMany({
      where: {
        groupId,
        userId,
        status: RequestStatus.PENDING,
        userRequested: {
          in: appOwnerIds,
        },
      },
      select: {
        userRequested: true,
      },
    });

    const pendingRequestUserIds = new Set(
      pendingRequests.map((request) => request.userRequested)
    );

    return groupApps.map(({ app }) => ({
      ...app,
      requestSent: pendingRequestUserIds.has(app.userId),
    }));
  } catch (error) {
    console.error("Error getting group apps and requests:", error);
    throw error;
  }
};