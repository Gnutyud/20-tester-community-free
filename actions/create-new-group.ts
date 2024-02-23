"use server";

import * as z from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewGroupSchema } from "@/schemas";

export const createNewGroup = async (values: z.infer<typeof NewGroupSchema>) => {
  const validatedFields = NewGroupSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { maxMembers } = validatedFields.data;

  const user = await currentUser();

  // Create the group in the database
  const createdGroup = await db.group.create({
    data: {
      maxMembers,
      user: { connect: { id: user?.id } }, // Connect the group to the user who created it
    },
  });

  // Add the user as a member of the group
  await db.groupUser.create({
    data: {
      user: { connect: { id: user?.id } },
      group: { connect: { id: createdGroup.id } },
    },
  });

  return { success: "Create new group success!" };
};
