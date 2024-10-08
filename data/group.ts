import { db } from "@/lib/db";
import {
  sendNotiDoneStep1,
  sendNotiDoneStep2,
  sendNotiDoneStep3,
} from "@/lib/mail";
import { filterUniqueNotificationMessages } from "@/lib/notifications";
import { RequestStatus, StatusTypes } from "@prisma/client";
import { scheduleJob } from "node-schedule";

// Function to check and update group status
export const checkAndUpdateGroupStatus = async (
  groupId: string
): Promise<void> => {
  try {
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        groupUsers: {
          include: {
            user: true, // Include the user details
          },
        },
        confirmRequests: true, // Include the confirm requests of the group
      }, // Include the members of the group
    });

    if (!group) return;
    if (
      group?.groupUsers.length < group.maxMembers &&
      group.status !== StatusTypes.OPEN
    ) {
      // Update the group status to PENDING (Step 2)
      await db.group.update({
        where: { id: groupId },
        data: {
          status: StatusTypes.OPEN,
        },
      });
    }
    if (
      group?.groupUsers.length >= group.maxMembers &&
      group.status === StatusTypes.OPEN
    ) {
      // Update the group status to PENDING (Step 2)
      await db.group.update({
        where: { id: groupId },
        data: {
          status: StatusTypes.PENDING,
        },
      });
      // push notification to all members to start testing each other's apps
      const notificationMessage = `Your group test is ready to start the next step. Let's become testers for each other.`;
      for (const user of group.groupUsers) {
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
      const memberEmailList = (
        group.groupUsers.map((groupUser) => groupUser.user.email || "") || []
      ).toString();
      await sendNotiDoneStep1(memberEmailList, groupId);
    }
    if (
      group.confirmRequests.filter(
        (request) => request.status === RequestStatus.ACCEPTED
      ).length === group.maxMembers &&
      group.status === StatusTypes.PENDING
    ) {
      // Update the group status to INPROGRESS (Step 3)
      await db.group.update({
        where: { id: groupId },
        data: {
          status: StatusTypes.INPROGRESS,
          startedTestDate: new Date(),
        },
      });
      // push notification to all members to start testing each other's apps
      const notificationMessage = `Congratulations! You have almost completed the required 20 tests on Google Play. Just keep testing members's apps every day for ${Number(
        process.env.NUMBER_OF_DAYS_TO_COMPLETE || 14
      )} days from now to complete the group test.`;
      for (const user of group.groupUsers) {
        // Create a notification for each user in the group
        await db.notification.create({
          data: {
            groupId: groupId,
            userId: user.user.id,
            title: "All members are already became testers!",
            message: notificationMessage,
          },
        });
      }
      // send email to all members to start testing each other's apps
      const memberEmailList = (
        group.groupUsers.map((groupUser) => groupUser.user.email || "") || []
      ).toString();
      await sendNotiDoneStep2(memberEmailList, groupId);
      // schedule a job to update group status to COMPLETED after 14 days (Step 4)
      scheduleJob(
        new Date(
          Date.now() +
            Number(process.env.NUMBER_OF_DAYS_TO_COMPLETE || 14) *
              24 *
              60 *
              60 *
              1000
        ),
        async () => {
          await db.group.update({
            where: { id: groupId },
            data: {
              status: StatusTypes.COMPLETE,
            },
          });

          // push notification to all members to start testing each other's apps
          const notificationMessage = `Congratulations! Your group test has been completed successfully. Thank you for using our service.`;
          for (const user of group.groupUsers) {
            // Create a notification for each user in the group
            await db.notification.create({
              data: {
                groupId: groupId,
                userId: user.user.id,
                title: "Group test has been completed!",
                message: notificationMessage,
              },
            });
          }
          // send email to all members to start testing each other's apps
          const memberEmailList = (
            group.groupUsers.map((groupUser) => groupUser.user.email || "") ||
            []
          ).toString();
          await sendNotiDoneStep3(memberEmailList);
        }
      );
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
        confirmRequests: true, // Include the confirm requests of the group
        groupUsers: {
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
      users: group.groupUsers.map((groupUser) => {
        return {
          id: groupUser.user.id,
          email: groupUser.user.email,
          avatar: groupUser.user.image,
          name: groupUser.user.name,
          role: groupUser.user.role,
          lastActiveAt: groupUser.user.lastActiveAt,
        };
      }), // Get email of each user in the group
      becameTesterNumber: group.confirmRequests.filter(
        (request) => request.status === RequestStatus.ACCEPTED
      ).length,
    }));
    return formattedGroups;
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

export const getGroupById = async (id: string) => {
  try {
    const group = await db.group.findUnique({
      where: { id },
      include: {
        confirmRequests: true, // Include the confirm requests of the group
        groupUsers: {
          include: {
            user: true, // Include the user details
          },
        },
        notifications: true, // Include the notifications of the group
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }, // Include the members of the group
    });

    if (!group) return null;

    // Map over the groups and transform the data to include only necessary information
    const formattedGroups = {
      ...group,
      users: group.groupUsers.map((groupUser) => {
        return {
          id: groupUser.user.id,
          email: groupUser.user.email,
          avatar: groupUser.user.image,
          name: groupUser.user.name,
          role: groupUser.user.role,
          lastActiveAt: groupUser.user.lastActiveAt,
        };
      }), // Get email of each user in the group
      becameTesterNumber: group.confirmRequests.filter(
        (request) => request.status === RequestStatus.ACCEPTED
      ).length,
      notifications: filterUniqueNotificationMessages(group.notifications),
      // apps: group.GroupApps.map((groupApp) => {
      //   return groupApp.app;
      // }), // Get email of each user in the group
    };

    return formattedGroups;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

export const getTestersCountInGroup = async (
  groupId: string
): Promise<number> => {
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

export const joinGroup = async (
  appId: string,
  groupId: string
): Promise<void> => {
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

export const leaveGroup = async (
  appId: string,
  groupId: string,
  userId: string
): Promise<void> => {
  try {
    // Remove the association of the app with the group
    await db.groupApps.deleteMany({
      where: {
        appId: appId,
        groupId: groupId,
      },
    });

    // Remove the user from the group
    await db.groupUser.deleteMany({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });

    // Delete requests created by the user (where the user is the requester)
    await db.request.deleteMany({
      where: {
        groupId,
        userId,
      },
    });

    // Delete requests addressed to the user (where the user is the app owner)
    await db.request.deleteMany({
      where: {
        groupId,
        userRequested: userId,
      },
    });

    console.log(
      `User ${userId} and app ${appId} left the group ${groupId} successfully.`
    );
  } catch (error: any) {
    console.error(`Failed to leave the group: ${error.message}`);
    throw new Error(`Failed to leave the group: ${error.message}`);
  }
};
