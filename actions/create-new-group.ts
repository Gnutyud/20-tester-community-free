"use server";

import * as z from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewGroupSchema } from "@/schemas";
import { joinGroup } from "@/data/group";

export const createNewGroup = async (values: z.infer<typeof NewGroupSchema>) => {
  try {
    const validatedFields = NewGroupSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { maxMembers, appId } = validatedFields.data;

    const user = await currentUser(); // Assuming this function retrieves the current user
    if (!user) {
      return { error: "User not authenticated!" };
    }

    // Create the group in the database
    const newGroup = await db.group.create({
      data: {
        maxMembers,
        groupUsers: {
          create: {
            user: { connect: { id: user.id } }
          }
        }
      },
      include: {
        groupUsers: true
      }
    });

    // Add the selected app to the group
    await joinGroup(appId.toString(), newGroup.id); // Assuming joinGroup function handles joining app to group

    return { success: "Create new group success!" };
  } catch (error) {
    console.error('Error creating new group:', error);
    return { error: "Internal server error" };
  }
};
