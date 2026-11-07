"use server";

import {
  AUTH_FAILURE_MESSAGE,
  checkRateLimit,
  clearAuthCookie,
  clearRateLimit,
  createSessionToken,
  getClientIdentifier,
  hashPassword,
  setAuthCookie,
  verifyPassword,
  clearAllCookies,
} from "@/lib/auth/security";
import { createSupabaseServerClient, supabase } from "@/lib/db/supabase";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";
import { cookies } from "next/headers";

export type AuthResult = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
  };
  url?: string;
};

export async function signInWithGoogle(): Promise<AuthResult> {
  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const redirectTo = new URL("/auth/callback", siteOrigin).toString();

  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data?.url) {
    return {
      success: false,
      message: "Unable to start Google sign-in. Please try again.",
    };
  }
  return {
    success: true,
    message: "Redirecting to Google…",
    url: data.url,
  };
}

export async function signUpUser(formData: FormData): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid signup details.",
    };
  }

  const { username, password } = parsed.data;
  const clientIdentifier = await getClientIdentifier();
  const signupKey = `signup:${clientIdentifier}`;
  const rateLimit = checkRateLimit(signupKey, 5, 60_000, 60_000);

  if (!rateLimit.allowed) {
    return {
      success: false,
      message: "Too many signup attempts. Please try again shortly.",
    };
  }

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUserError) {
    clearRateLimit(signupKey);
    return {
      success: false,
      message: "Unable to create account at the moment. Please try again.",
    };
  }

  if (existingUser) {
    clearRateLimit(signupKey);
    return {
      success: false,
      message: "Username is already taken. Please choose another.",
    };
  }

  const passwordHash = await hashPassword(password);
  const { data: createdUser, error: insertError } = await supabase
    .from("users")
    .insert({
      username,
      password_hash: passwordHash,
    })
    .select("id, username")
    .single();

  if (insertError || !createdUser) {
    clearRateLimit(signupKey);
    return {
      success: false,
      message: "Unable to create account at the moment. Please try again.",
    };
  }

  const token = await createSessionToken(createdUser.id, createdUser.username);
  await setAuthCookie(token);
  clearRateLimit(signupKey);

  return {
    success: true,
    message: "Account created successfully.",
    user: {
      id: createdUser.id,
      username: createdUser.username,
    },
  };
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid login details.",
    };
  }

  const { username, password } = parsed.data;
  const clientIdentifier = await getClientIdentifier();
  const loginKey = `login:${clientIdentifier}:${username}`;
  const rateLimit = checkRateLimit(loginKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      success: false,
      message: AUTH_FAILURE_MESSAGE,
    };
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password_hash, failed_login_attempts, lockout_until")
    .eq("username", username)
    .maybeSingle();

  if (error || !user) {
    return {
      success: false,
      message: AUTH_FAILURE_MESSAGE,
    };
  }

  if (
    user.lockout_until &&
    new Date(user.lockout_until).getTime() > Date.now()
  ) {
    return {
      success: false,
      message: AUTH_FAILURE_MESSAGE,
    };
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);

  if (!passwordMatches) {
    const failedLoginAttempts = (user.failed_login_attempts ?? 0) + 1;
    const lockoutUntil =
      failedLoginAttempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : null;

    await supabase
      .from("users")
      .update({
        failed_login_attempts: failedLoginAttempts,
        lockout_until: lockoutUntil,
      })
      .eq("id", user.id);

    return {
      success: false,
      message: AUTH_FAILURE_MESSAGE,
    };
  }

  await supabase
    .from("users")
    .update({
      failed_login_attempts: 0,
      lockout_until: null,
    })
    .eq("id", user.id);

  const token = await createSessionToken(user.id, user.username);
  await setAuthCookie(token);
  clearRateLimit(loginKey);

  return {
    success: true,
    message: "Signed in successfully.",
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

export async function logoutUser(): Promise<AuthResult> {
  await clearAllCookies();
  // await clearAuthCookie();
  return {
    success: true,
    message: "Signed out successfully.",
  };
}
