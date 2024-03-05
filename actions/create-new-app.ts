"use server";

import * as z from "zod";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewAppSchema } from "@/schemas";

export const createNewApp = async (values: z.infer<typeof NewAppSchema>) => {
  const validatedFields = NewAppSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { appName, packageName, installUrl } = validatedFields.data;

  const user = await currentUser();

  // Create the group in the database
  const createdGroup = await db.app.create({
    data: {
      appName,
      packageName,
      installUrl,
      user: { connect: { id: user?.id } }, // Connect the app to the user who created it
    },
  });

  return { success: "Create new app success!" };
};
