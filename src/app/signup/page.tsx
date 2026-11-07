import Link from "next/link";

import { signUpUser } from "@/app/actions/auth";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-sm">
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            AI Personal Economic Advisor
          </p>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            await signUpUser(formData);
          }}
          className="space-y-4"
        >
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Username</span>
            <input
              name="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Choose a username"
              required
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Create a strong password"
              required
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
              placeholder="Confirm your password"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Create account
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-cyan-300 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
