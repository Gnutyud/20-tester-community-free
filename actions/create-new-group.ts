"use server";

import * as z from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewGroupSchema } from "@/schemas";
import { joinGroup } from "@/data/group";

export const createNewGroup = async (values: z.infer<typeof NewGroupSchema>) => {
  const validatedFields = NewGroupSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { maxMembers, appId } = validatedFields.data;

  const user = await currentUser();

  // Create the group in the database
  const newGroup = await db.group.create({
    data: {
      maxMembers,
      users: { connect: { id: user?.id } }, // Connect the group to the user who created it
    },
  });

  // Add the user as a member of the group
  await db.groupUser.create({
    data: {
      user: { connect: { id: user?.id } },
      group: { connect: { id: newGroup.id } },
    },
  });

  // Add the selected app to the group
  await joinGroup(appId, newGroup.id);

  return { success: "Create new group success!" };
};
