"use client";

import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./AdminLogoutButton";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  TicketPercent,
  Settings,
  ArrowLeft,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

export function AdminShellClient({
  children,
  username,
}: {
  children: React.ReactNode;
  username?: string;
}) {
  const pathname = usePathname();

  // Render the login screen clean without the admin sidebar/header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard & KPIs", shortLabel: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders & Dispatch", shortLabel: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products & Inventory", shortLabel: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories & Departments", shortLabel: "Categories", icon: Layers },
    { href: "/admin/discounts", label: "Coupons & Promotions", shortLabel: "Coupons", icon: TicketPercent },
    { href: "/admin/settings", label: "Shipping, Bank & Settings", shortLabel: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fdfbf7] text-stone-800">
      {/* Light Alabaster Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-[#f5f0e6] text-stone-700 p-4 sm:p-5 shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200/90">
        <div>
          <div className="flex items-center justify-between lg:block pb-4 border-b border-stone-200/90 mb-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Almoin Store"
                width={40}
                height={48}
                className="h-11 w-auto object-contain shrink-0"
              />
              <div>
                <span className="font-serif text-base sm:text-lg font-bold tracking-[0.06em] text-stone-900 block leading-tight">
                  ALMOIN STORE
                </span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-amber-800 font-semibold block mt-0.5">
                  Store Operations Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/admin/products?action=new"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-700 text-white text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add
              </Link>
              <AdminLogoutButton />
            </div>
          </div>

          {/* Quick Add Product CTA (Desktop) */}
          <div className="hidden lg:block mb-5">
            <Link
              href="/admin/products?action=new"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Add New Product
            </Link>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-white text-amber-900 font-semibold shadow-2xs border border-amber-200/80"
                      : "text-stone-700 hover:bg-white/70 hover:text-amber-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="lg:hidden">{item.shortLabel}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block pt-6 border-t border-stone-200/90 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-stone-200/80 text-[11px] text-stone-500 shadow-2xs space-y-2">
            <div>
              <span className="text-stone-900 font-semibold block">
                Signed in as: {username || "admin"}
              </span>
              <span className="text-emerald-700 font-medium">
                ● Role: Store Administrator
              </span>
            </div>
            <AdminLogoutButton fullWidth />
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-600 hover:text-amber-800 font-semibold transition py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> View Live Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 py-3.5 px-6 flex items-center justify-between sticky top-0 z-20">
          <h1 className="font-serif text-lg sm:text-xl font-semibold text-stone-900">
            Store Administration &amp; Operations
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-xs px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authenticated ({username || "admin"})
            </span>
            <div className="hidden lg:block">
              <AdminLogoutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}

