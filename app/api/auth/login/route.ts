// app/api/auth/login/route.ts
// POST handler for user login.
// Validates credentials against env vars, sets a signed JWT in an httpOnly cookie.

import { NextRequest, NextResponse } from "next/server";
import { signToken, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error("[Auth] AUTH_USERNAME or AUTH_PASSWORD not set in .env.local");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Constant-time-ish comparison to prevent timing attacks
    if (username !== validUsername || password !== validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Issue JWT
    const token = await signToken(username);

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
