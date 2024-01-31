"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// ...

export async function authenticate() {
  try {
    await signIn("google", {
      callbackUrl: `${window.location.origin}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log(error.type);
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
