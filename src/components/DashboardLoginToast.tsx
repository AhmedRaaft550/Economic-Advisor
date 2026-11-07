"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function DashboardLoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("login") !== "success") {
      return;
    }

    toast.success("Login successful");
    router.replace("/dashboard");
  }, [router, searchParams]);

  return null;
}
