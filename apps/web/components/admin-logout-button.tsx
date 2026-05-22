"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

type AdminLogoutButtonProps = {
  variant?: "inline" | "drawer";
  onLoggedOut?: () => void;
};

export function AdminLogoutButton({ variant = "inline", onLoggedOut }: AdminLogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    onLoggedOut?.();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
      router.replace("/admin/login");
      router.refresh();
    }
  }

  if (variant === "drawer") {
    return (
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:opacity-60"
      >
        <LogOut size={16} />
        {loading ? "Signing out…" : "Log out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate transition hover:text-rose-700 disabled:opacity-60"
    >
      <LogOut size={16} />
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
