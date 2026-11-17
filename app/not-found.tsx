import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4 text-stone-900">
      <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
          404 • Not Found
        </p>
        <h1 className="font-serif text-3xl font-medium">
          Page not found
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          The tableware piece or page you are looking for may have moved or is
          no longer available.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-amber-800 transition"
          >
            Browse Catalog
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

