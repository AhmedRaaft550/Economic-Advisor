import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/helper/user-session";
import Spinner from "@/components/ui/Spinner";
import { LogoutButton } from "./Logoutbutton";
import { DashboardLoginToast } from "@/components/DashboardLoginToast";

function DashboardSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-sm text-slate-300">
        <Spinner size="small" />
      </div>
    </main>
  );
}

async function DashboardContent() {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">Welcome back</h1>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-400">Authenticated user</p>
          <p className="mt-2 text-xl font-semibold text-cyan-300">
            {session?.username}
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Your secure session is protected with an HTTP-only, Strict SameSite
            cookie.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <>
      <DashboardLoginToast />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
