"use client";

import { useState } from "react";
import { logoutUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await logoutUser();

      if (response.success) {
        toast.success("Logged out successfully");
        router.push("/login");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to logout");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
    >
      {"Sign out"}
    </button>
  );
}
