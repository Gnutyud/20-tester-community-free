import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/data/user";

/**
 * Mobile session exchange endpoint
 * 
 * This endpoint allows mobile apps to exchange a token for session data.
 * The token is generated during OAuth callback and contains user information.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Decode the token
    try {
      const tokenData = JSON.parse(
        Buffer.from(token, "base64url").toString("utf-8")
      );

      // Verify token hasn't expired
      if (new Date(tokenData.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Token expired" },
          { status: 401 }
        );
      }

      // Verify user still exists (optional validation)
      const user = await getUserById(tokenData.userId);

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Return session data based on the token
      // The token contains the user data from when OAuth completed
      return NextResponse.json({
        user: {
          id: tokenData.userId,
          name: tokenData.name ?? user.name,
          email: tokenData.email ?? user.email,
          image: tokenData.image ?? user.image ?? null,
          role: tokenData.role ?? user.role,
          isOAuth: tokenData.isOAuth ?? false,
          isTwoFactorEnabled: tokenData.isTwoFactorEnabled ?? user.isTwoFactorEnabled,
        },
        expires: tokenData.expiresAt,
      });
    } catch (decodeError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Mobile session exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

