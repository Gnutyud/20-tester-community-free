import { db } from "@/lib/db";
import { sendNotiDoneStep1 } from "@/lib/mail";
import { filterUniqueNotificationMessages } from "@/lib/notifications";
import { RequestStatus, StatusTypes } from "@prisma/client";

// Function to check and update group status
export const checkAndUpdateGroupStatus = async (groupId: number): Promise<void> => {
  try {
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        GroupUser: {
          include: {
            user: true, // Include the user details
          },
        },
      }, // Include the members of the group
    });

    if (!group) return;

    if (group?.GroupUser.length >= group.maxMembers) {
      // Update the group status to PENDING (Step 2)
      await db.group.update({
        where: { id: groupId },
        data: {
          status: StatusTypes.PENDING,
        },
      });
      // push notification to all members to start testing each other's apps
      const notificationMessage = `Your group test is ready to start the next step. Let's become testers for each other.`;
      for (const user of group.GroupUser) {
        // Create a notification for each user in the group
        await db.notification.create({
          data: {
            groupId: groupId,
            userId: user.user.id,
            title: "All members are ready to start testing!",
            message: notificationMessage,
          },
        });
      }
      // send email to all members to start testing each other's apps
      const memberEmailList = (group.GroupUser.map((groupUser) => groupUser.user.email || "") || []).toString();
      await sendNotiDoneStep1(memberEmailList, groupId);
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
      users: group.GroupUser.map((groupUser) => {
        return {
          id: groupUser.user.id,
          email: groupUser.user.email,
          avatar: groupUser.user.image,
          name: groupUser.user.name,
        };
      }), // Get email of each user in the group
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
      include: {
        confirmRequests: true, // Include the confirm requests of the group
        GroupUser: {
          include: {
            user: true, // Include the user details
          },
        },
        notifications: true, // Include the notifications of the group
        // GroupApps: {
        //   include: {
        //     app: true // Include all information about the associated apps
        //   },
        // },
      }, // Include the members of the group
    });

    if (!group) return null;

    // Map over the groups and transform the data to include only necessary information
    const formattedGroups = {
      ...group,
      users: group.GroupUser.map((groupUser) => {
        return {
          id: groupUser.user.id,
          email: groupUser.user.email,
          avatar: groupUser.user.image,
          name: groupUser.user.name,
        };
      }), // Get email of each user in the group
      becameTesterNumber: group.confirmRequests.filter((request) => request.status === RequestStatus.ACCEPTED).length,
      notifications: filterUniqueNotificationMessages(group.notifications),
      // apps: group.GroupApps.map((groupApp) => {
      //   return groupApp.app;
      // }), // Get email of each user in the group
    };

    return formattedGroups;
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
};
