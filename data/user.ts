import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const updateLastActive = async (userId: string) => {
  try {
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() }, // Update the last active time to now
      });
    }
  } catch (error) {
    return null;
  }
};
