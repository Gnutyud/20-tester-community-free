import { db } from "@/lib/db";
import { RequestStatus } from "@prisma/client";

// Function to check and update group status
export const checkAndUpdateGroupStatus = async (groupId: number): Promise<void> => {
  try {
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { users: true }, // Include the members of the group
    });

    if (!group) return;

    if (group?.users.length >= group.maxMembers) {
      await db.group.update({
        where: { id: groupId },
        data: {
          status: "INPROGRESS",
        },
      });
    }
  } catch (error) {
    console.error("Error updating group status:", error);
    throw error;
  }
};

export const getGroups = async () => {
  try {
    const groupsWithMembers = await db.group.findMany({
      include: {
        users: true, // Include the members of the group
        confirmRequests: true, // Include the confirm requests of the group
        GroupUser: {
          include: {
            user: true, // Include the user details
          },
        },
      },
    });

    if (!groupsWithMembers) return [];

    // Map over the groups and transform the data to include only necessary information
    const formattedGroups = groupsWithMembers.map((group) => ({
      ...group,
      users: group.GroupUser.map((groupUser) => groupUser.user.email), // Get email of each user in the group
      becameTesterNumber: group.confirmRequests.filter((request) => request.status === RequestStatus.ACCEPTED).length,
    }));
    return formattedGroups;
  } catch {
    return [];
  }
};

export const getGroupById = async (id: number) => {
  try {
    const group = await db.group.findUnique({
      where: { id },
      include: { users: true }, // Include the members of the group
    });

    return group;
  } catch {
    return null;
  }
};

export const getTestersCountInGroup = async (groupId: number): Promise<number> => {
  try {
    // Get distinct user IDs from accepted requests in the group
    const confirmedTestersCount = await db.request.findMany({
      where: {
        groupId: groupId,
        status: RequestStatus.ACCEPTED,
      },
      distinct: ["userId"],
    });

    if (!confirmedTestersCount) return 0;

    return confirmedTestersCount.length;
  } catch (error: any) {
    // Handle errors
    throw new Error(`Failed to get testers count in group: ${error?.message}`);
  }
};

export const joinGroup = async (appId: number, groupId: number): Promise<void> => {
  try {
    // Check if the association already exists
    const existingAssociation = await db.groupApps.findFirst({
      where: {
        appId: appId,
        groupId: groupId,
      },
    });

    if (existingAssociation) {
      throw new Error("App is already joined to the group");
    }

    // Create a new association between the app and the group
    await db.groupApps.create({
      data: {
        appId: appId,
        groupId: groupId,
      },
    });
  } catch (error: any) {
    // Handle errors
    throw new Error(`Failed to join group: ${error.message}`);
  }
}
