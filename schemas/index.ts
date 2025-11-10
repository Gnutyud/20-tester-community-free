import { UserRole } from "@prisma/client";
import * as z from "zod";

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    }
  );

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const NewAppSchema = z.object({
  appName: z.string().min(1, {
    message: "App name is required",
  }),
  packageName: z.string().min(1, {
    message: "Package name is required",
  }),
  installUrl: z.string().refine(
    (url) => {
      const regex = /^(https?:\/\/)?(play\.google\.com\/(store\/apps\/details\?id=|apps\/testing\/))([\w.-]+)\/?$/;
      return regex.test(url);
    },
    {
      message: "Invalid app install URL format",
    }
  ),
  googleGroupUrl: z.string().refine(
    (url) => {
      const regex = /^https:\/\/groups\.google\.com/;
      return regex.test(url);
    },
    {
      message: "Invalid Google Groups URL format",
    }
  ),
  targetTesterCount: z.coerce
    .number({
      invalid_type_error: "Number of testers is required",
    })
    .int()
    .min(4, {
      message: "You need at least 4 testers",
    })
    .max(50, {
      message: "Tester target too high",
    }),
});
