import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/security";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role-key";

function assertSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
}

const authConfig = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
  flowType: "pkce" as const,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authConfig,
});

// => supabase Config
export async function createSupabaseServerClient() {
  assertSupabaseConfig();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore write failures in server actions or unsupported runtime environments.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey ?? supabaseAnonKey,
  {
    auth: authConfig,
  },
);

export async function getAuthenticatedUserIdFromCookie(): Promise<string> {
  assertSupabaseConfig();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new Error("Authentication cookie missing");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    throw new Error("Invalid or expired authentication session");
  }

  return session.sub;
}

export async function setAuthenticatedUserContext(
  userId: string,
): Promise<void> {
  assertSupabaseConfig();

  const { error } = await supabaseAdmin.rpc("set_request_user_context", {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(
      `Failed to inject authenticated user context: ${error.message}`,
    );
  }
}

export async function withAuthenticatedDbContext<T>(
  callback: (client: SupabaseClient) => Promise<T>,
): Promise<T> {
  assertSupabaseConfig();

  const userId = await getAuthenticatedUserIdFromCookie();
  await setAuthenticatedUserContext(userId);
  return callback(supabaseAdmin);
}

export async function getAuthenticatedSupabaseClient(): Promise<SupabaseClient> {
  assertSupabaseConfig();

  const userId = await getAuthenticatedUserIdFromCookie();
  await setAuthenticatedUserContext(userId);
  return supabaseAdmin;
}
