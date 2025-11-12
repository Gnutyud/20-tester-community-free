import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Mobile OAuth callback endpoint
 * 
 * This endpoint handles OAuth callbacks for mobile apps.
 * After OAuth completes, it:
 * 1. Gets the current session
 * 2. Generates a temporary token
 * 3. Redirects to the mobile app deep link with the token
 * 
 * The mobile app can then exchange this token for the session.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the current session after OAuth completes
    const session = await auth();

    if (!session || !session.user) {
      // If no session, redirect to login with error
      const errorUrl = "20-tester-community://oauth/callback?error=no_session";
      return NextResponse.redirect(errorUrl);
    }

    // Generate a temporary token for the mobile app
    // This token will be used to exchange for the session
    // We encode the session data in the token itself (base64url encoded JSON)
    // In production, you might want to store this in Redis or a database for better security
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const tokenData = {
      userId: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      image: session.user.image ?? null,
      role: session.user.role ?? "USER",
      isOAuth: session.user.isOAuth ?? false,
      isTwoFactorEnabled: session.user.isTwoFactorEnabled ?? false,
      expiresAt: expiresAt.toISOString(),
    };

    // Encode the token data (in production, use a proper JWT or store in DB)
    const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString("base64url");

    // Check if this is a request from the mobile app (via fetch) or browser redirect
    const userAgent = request.headers.get("user-agent") || "";
    const isMobileApp = userAgent.includes("Expo") || request.headers.get("x-requested-with") === "mobile";
    
    // If it's a mobile app request, return JSON with the token
    // Otherwise, return HTML that redirects to deep link
    if (isMobileApp || request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({
        success: true,
        token: encodedToken,
        deepLink: `20-tester-community://oauth/callback?token=${encodedToken}`,
      });
    }
    
    // For browser requests, return HTML that redirects to deep link
    const deepLinkUrl = `20-tester-community://oauth/callback?token=${encodedToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${deepLinkUrl}">
          <script>
            window.location.href = "${deepLinkUrl}";
          </script>
        </head>
        <body>
          <p>Redirecting to app...</p>
          <p>If you are not redirected, <a href="${deepLinkUrl}">click here</a>.</p>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Mobile callback error:", error);
    const errorUrl = "20-tester-community://oauth/callback?error=auth_failed";
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${errorUrl}">
          <script>
            window.location.href = "${errorUrl}";
          </script>
        </head>
        <body>
          <p>Authentication failed. Redirecting...</p>
          <p>If you are not redirected, <a href="${errorUrl}">click here</a>.</p>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
}

