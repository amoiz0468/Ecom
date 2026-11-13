"use client";

import { Printer } from "lucide-react";

export function PrintSlipButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
    >
      <Printer className="w-4 h-4" /> Print Packing Slip (Ctrl + P)
    </button>
  );
}

