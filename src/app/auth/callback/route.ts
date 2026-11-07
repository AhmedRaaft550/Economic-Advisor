import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  hashPassword,
  setAuthCookie,
} from "@/lib/auth/security";
import {
  createSupabaseServerClient,
  setAuthenticatedUserContext,
  supabaseAdmin,
} from "@/lib/db/supabase";

function buildGoogleUsername(email: string): string {
  const localPart = (email.split("@")[0] ?? "googleuser")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);

  return localPart || "googleuser";
}

async function ensureGoogleUser(email: string) {
  const baseUsername = buildGoogleUsername(email);
  let candidateUsername = baseUsername;
  let suffix = 1;

  while (true) {
    const { data: existingUser, error } = await supabaseAdmin
      .from("users")
      .select("id, username")
      .eq("username", candidateUsername)
      .maybeSingle();

    if (error) {
      const message = error.message.includes("Could not find the table")
        ? "Supabase schema is missing the public.users table. Run the project migration first."
        : error.message;

      throw new Error(`Failed to look up Google user: ${message}`);
    }

    if (!existingUser) {
      const userId = crypto.randomUUID();
      const randomPassword = `google-oauth:${userId}`;
      const passwordHash = await hashPassword(randomPassword);

      await setAuthenticatedUserContext(userId);

      const { data: createdUser, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          id: userId,
          username: candidateUsername,
          password_hash: passwordHash,
        })
        .select("id, username")
        .single();

      if (insertError || !createdUser) {
        const message = insertError?.message?.includes("Could not find the table")
          ? "Supabase schema is missing the public.users table. Run the project migration first."
          : insertError?.message ?? "Unknown error";

        throw new Error(`Failed to create Google user: ${message}`);
      }

      return createdUser;
    }

    candidateUsername = `${baseUsername}${suffix}`.slice(0, 24);
    suffix += 1;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const errorDescription = request.nextUrl.searchParams.get("error_description");
  const hash = request.nextUrl.hash || "";

  if (hash.includes("access_token") || hash.includes("refresh_token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "oauth_error",
      "OAuth tokens were returned in the URL fragment. Please retry the Google login using the secure PKCE flow.",
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", request.url);
    if (errorDescription) {
      loginUrl.searchParams.set("oauth_error", errorDescription);
    }

    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (error || !data.session?.user?.email) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "oauth_error",
        error?.message ?? "Google authentication failed.",
      );
      return NextResponse.redirect(loginUrl);
    }

    const googleUser = data.session.user;
    const appUser = await ensureGoogleUser(
      googleUser.email ?? `${googleUser.id}@google.local`,
    );
    const token = await createSessionToken(appUser.id, appUser.username);
    const response = new NextResponse(
      `<!doctype html><html><body><script>window.location.replace("/dashboard?login=success");</script></body></html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
    await setAuthCookie(token, response);

    return response;
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "oauth_error",
      error instanceof Error ? error.message : "Google authentication failed.",
    );
    return NextResponse.redirect(loginUrl);
  }
}
