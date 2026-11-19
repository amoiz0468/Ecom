"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4 text-stone-900">
      <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
          Almoin Store
        </p>
        <h1 className="font-serif text-3xl font-medium">
          Something went wrong
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          We encountered a temporary issue loading this page. Please try again
          or return to the storefront.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-amber-800 transition cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

