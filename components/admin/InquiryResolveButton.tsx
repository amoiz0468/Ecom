"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function InquiryResolveButton({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: "unread" | "resolved";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "resolved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
      </span>
    );
  }

  const handleResolve = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiryId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResolve}
      disabled={loading}
      className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 text-[11px] font-semibold text-stone-700 transition cursor-pointer disabled:opacity-50"
    >
      {loading ? "Saving..." : "Mark Resolved"}
    </button>
  );
}

