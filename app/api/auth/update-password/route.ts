// app/api/auth/update-password/route.ts
// POST handler to update user password.
// Requires valid JWT session cookie. Validates current password before hashing and updating the new one.

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.username) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const username = payload.username;

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new passwords are required" },
        { status: 400 }
      );
    }

    // Lookup user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 401 }
      );
    }

    // Hash new password and update DB
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { username },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Update Password API Error]", error);
    return NextResponse.json(
      { error: "Invalid request or server error" },
      { status: 500 }
    );
  }
}
