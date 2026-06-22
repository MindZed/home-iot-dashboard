// lib/auth.ts
// JWT utilities for authentication. Uses `jose` which is Edge-compatible,
// so this works in both API routes (Node) and middleware (Edge runtime).

import { SignJWT, jwtVerify } from "jose";

// ── Constants ───────────────────────────────────────────────────────────────

const COOKIE_NAME = "iot-session";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

/**
 * Encode the JWT_SECRET env var into a Uint8Array key for jose.
 * Called at runtime so env vars are read fresh from process.env.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables");
  return new TextEncoder().encode(secret);
}

/**
 * Sign a new JWT for the given username.
 * Returns the compact JWS string.
 */
export async function signToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());
}

/**
 * Verify a JWT and return its payload.
 * Returns `null` if the token is invalid, expired, or malformed.
 */
export async function verifyToken(
  token: string
): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { username: string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, SESSION_DURATION };
