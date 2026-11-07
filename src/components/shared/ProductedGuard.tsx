import { getSessionFromCookie } from "@/helper/user-session";

export default async function ProtectedGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookie();

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
