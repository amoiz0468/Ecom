"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton({ fullWidth }: { fullWidth?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`${
        fullWidth ? "w-full justify-center" : ""
      } inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 bg-stone-50 hover:bg-red-50 hover:border-red-300 text-stone-700 hover:text-red-700 text-xs font-semibold transition cursor-pointer`}
    >
      <LogOut className="w-3.5 h-3.5" /> Sign Out
    </button>
  );
}

