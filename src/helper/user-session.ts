import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/security";

export async function getSessionFromCookie() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
  return sessionToken ? verifySessionToken(sessionToken) : null;
}
