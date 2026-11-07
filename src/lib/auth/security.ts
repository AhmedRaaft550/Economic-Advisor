import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const AUTH_COOKIE_NAME = "user_session";
export const AUTH_FAILURE_MESSAGE = "Invalid username or password";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "change-me-in-production-please-use-a-long-secret",
);

// => to check how many times users are tried to log in
const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number; lockoutUntil?: number }
>();

export function safeStringCompare(a: string, b: string): boolean {
  const encodedA = new TextEncoder().encode(a);
  const encodedB = new TextEncoder().encode(b);

  if (encodedA.length !== encodedB.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < encodedA.length; index += 1) {
    mismatch |= encodedA[index] ^ encodedB[index];
  }

  return mismatch === 0;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(
  userId: string,
  username: string,
): Promise<string> {
  return new SignJWT({
    sub: userId,
    username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(AUTH_SECRET);
}

export async function verifySessionToken(token: string): Promise<{
  sub: string;
  username: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);

    if (
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }

    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

export async function setAuthCookie(
  token: string,
  response?: NextResponse,
): Promise<void> {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };

  if (response) {
    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions);
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function clearAllCookies() {
  const cookieStored = await cookies();
  cookieStored.getAll().map((val) => {
    return cookieStored.delete(val.name);
  });
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
  lockoutMs: number,
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (existing && existing.lockoutUntil && now < existing.lockoutUntil) {
    return {
      allowed: false,
      retryAfterMs: existing.lockoutUntil - now,
    };
  }

  if (!existing || now - existing.windowStart > windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      windowStart: now,
    });
    return { allowed: true };
  }

  const nextCount = existing.count + 1;

  if (nextCount > maxAttempts) {
    const lockoutUntil = now + lockoutMs;
    rateLimitStore.set(key, {
      count: nextCount,
      windowStart: existing.windowStart,
      lockoutUntil,
    });
    return {
      allowed: false,
      retryAfterMs: lockoutMs,
    };
  }

  rateLimitStore.set(key, {
    count: nextCount,
    windowStart: existing.windowStart,
  });

  return { allowed: true };
}

export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export async function getClientIdentifier(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const rawIdentifier = forwardedFor ?? realIp ?? "unknown";

  return rawIdentifier.split(",")[0].trim() || "unknown";
}
