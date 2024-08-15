"use server";

import * as z from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewGroupSchema } from "@/schemas";
import { joinGroup } from "@/data/group";
import { StatusTypes } from "@prisma/client";

export const createNewGroup = async (
  values: z.infer<typeof NewGroupSchema>
) => {
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

    const existingOpenGroupWithMaxMembers = await db.group.findFirst({
      where: { maxMembers: maxMembers, status: StatusTypes.OPEN },
    });

    if (existingOpenGroupWithMaxMembers)
      return {
        error: `We already have a group with maxMembers: ${maxMembers} is OPEN. Please join it instead of create a new one!`,
      };

    let groupNumber = 1;

    const existsGroupCounter = await db.counter.findUnique({
      where: { model: "Group" },
    });

    if (!existsGroupCounter) {
      await db.counter.create({
        data: {
          model: "Group",
          sequence: 1,
        },
      });
    } else {
      groupNumber = existsGroupCounter.sequence + 1;
      await db.counter.update({
        where: { model: "Group" },
        data: { sequence: groupNumber },
      });
    }

    // Create the group in the database
    const newGroup = await db.group.create({
      data: {
        maxMembers,
        groupUsers: {
          create: {
            user: { connect: { id: user.id! } },
          },
        },
        groupNumber: groupNumber,
        ownerId: user.id!,
      },
      include: {
        groupUsers: true,
      },
    });

    // Add the selected app to the group
    await joinGroup(appId.toString(), newGroup.id); // Assuming joinGroup function handles joining app to group

    return { success: "Create new group success!" };
  } catch (error) {
    console.error("Error creating new group:", error);
    return { error: "Internal server error" };
  }
};
