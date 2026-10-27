import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  CreditCard,
  FileSpreadsheet,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 p-5 shrink-0 flex flex-col justify-between border-r border-stone-800">
        <div>
          <div className="pb-6 border-b border-stone-800 mb-6">
            <Link href="/admin" className="font-serif text-xl font-bold tracking-wider text-white block">
              KHAAK & KHAZAF
            </Link>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold block">
              Store Operations Portal
            </span>
          </div>

          <nav className="space-y-1 text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-stone-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" /> Dashboard & Stats
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-stone-800 hover:text-white transition"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" /> Orders & Payments
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-stone-800 hover:text-white transition"
            >
              <Package className="w-4 h-4 text-amber-400" /> Products & Inventory
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 space-y-3 text-xs">
          <div className="p-2.5 rounded-lg bg-stone-800/80 text-[11px] text-stone-400">
            <span className="text-stone-200 font-semibold block">Role: Store Administrator</span>
            <span>Pakistan Operations Hub</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-4 px-6 flex items-center justify-between">
          <h1 className="font-serif text-lg font-bold">Admin Management Console</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              ● Live Store Active
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}
