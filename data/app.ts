import { db } from "@/lib/db";

export const getGroupAppsAndRequests = async (groupId: string, userId: string) => {
    try {
      // Retrieve all apps in the group
      const groupApps = await db.groupApps.findMany({
        where: {
          groupId,
          NOT: {
            app: {
              userId,
            },
          },
        },
        include: {
          app: true
        }
      });
  
      // Initialize an array to store information about each app and whether a request has been sent
      const appsWithRequests = [];
  
      // Iterate through each app in the group
      for (const groupApp of groupApps) {
        // Check if the user has sent a request for testing this app
        const request = await db.request.findFirst({
          where: {
            groupId,
            userId,
            requestedUser: {
              id: groupApp.app.userId // ID of the user who owns the app
            },
            status: 'PENDING', // Assuming you want to check only pending requests
          },
        });
  
        // Push information about the app and whether a request has been sent to the array
        appsWithRequests.push({
          ...groupApp.app,
          requestSent: !!request, // Convert request to a boolean value
        });
      }
  
      return appsWithRequests;
    } catch (error) {
      console.error('Error getting group apps and requests:', error);
      // Handle errors appropriately
      throw error;
    }
  }