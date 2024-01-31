import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })],
});
