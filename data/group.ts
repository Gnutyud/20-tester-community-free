import { db } from "@/lib/db";

// Function to check and update group status
export const checkAndUpdateGroupStatus = async (groupId: number): Promise<void> => {
  try {
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { members: true }, // Include the members of the group
    });

    if (!group) return;

    if (group?.members.length >= group.maxMembers) {
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
        members: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Map over the groups and transform the data to include only necessary information
    const formattedGroups = groupsWithMembers.map((group) => ({
      ...group,
      members: group.members.map((member) => member.user.email),
    }));
    return formattedGroups;
  } catch {
    return null;
  }
};

export const getGroupById = async (id: number) => {
  try {
    const group = await db.group.findUnique({ where: { id } });

    return group;
  } catch {
    return null;
  }
};
