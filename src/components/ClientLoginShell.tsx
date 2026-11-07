import dynamic from "next/dynamic";
import { loginUser, signInWithGoogle } from "@/app/actions/auth";

const LoginContainer = dynamic(
  () =>
    import("@/features/auth/login/LoginContainer").then(
      (module) => module.LoginContainer,
    ),
  {
    ssr: true,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-base text-slate-200">
        Loading vault access…
      </div>
    ),
  },
);

export function ClientLoginShell() {
  return <LoginContainer loginAction={loginUser} googleLoginAction={signInWithGoogle} />;
}
