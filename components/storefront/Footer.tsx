"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, PackageSearch, ShieldCheck, Info, Phone } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/lib/data/constants";

const MOBILE_FOOTER_NAV = [
  { label: "Home", href: "/", icon: Home, title: "Home" },
  { label: "Track Order", href: "/track", icon: PackageSearch, title: "Track Order" },
  { label: "Guarantee", href: "/breakage-policy", icon: ShieldCheck, title: "Breakage Guarantee" },
  { label: "About", href: "/about", icon: Info, title: "About" },
  { label: "Contact", href: "/contact", icon: Phone, title: "Contact" },
];

export function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState(
    DEFAULT_CATEGORIES.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567"
  );

  useEffect(() => {
    fetch("/api/store-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        if (data?.settings?.whatsapp_number) {
          setWhatsappNumber(data.settings.whatsapp_number);
        }
      })
      .catch(() => {});
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  return (
    <footer className="bg-[#f4efe6] text-stone-600 border-t border-stone-200/80 text-xs">
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group"
          >
            <Image
              src="/logo.png"
              alt="Almoin Crockery"
              width={52}
              height={62}
              className="h-14 w-auto object-contain shrink-0"
            />
            <div>
              <span className="font-serif text-lg font-semibold tracking-[0.06em] text-stone-900 group-hover:text-amber-800 transition-colors block">
                ALMOIN CROCKERY
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 block">
                المُعِين &bull; Pakistan
              </span>
            </div>
          </Link>
          <p className="leading-relaxed text-stone-500 max-w-xs">
            Fine bone china, stoneware, and artisan ceramics delivered across Pakistan.
          </p>
          <p className="text-stone-500">
            Karachi &bull; Lahore &bull;{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-800 hover:underline font-medium"
            >
              WhatsApp Support
            </a>
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
            Collections
          </h4>
          <ul className="space-y-2">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="hover:text-stone-900 transition"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
            Customer Care
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/track" className="hover:text-stone-900 font-medium text-stone-800 transition">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/breakage-policy" className="hover:text-stone-900 transition">
                Breakage Guarantee
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-stone-900 transition">
                Shipping &amp; COD
              </Link>
            </li>
            <li>
              <Link href="/care-guide" className="hover:text-stone-900 transition">
                Care Guide
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-stone-900 transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Payments */}
        <div>
          <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
            Payments
          </h4>
          <p className="text-stone-500 leading-relaxed">
            Cash on Delivery, Bank Transfer, JazzCash &amp; Easypaisa.
          </p>
        </div>
      </div>

      <div className="border-t border-stone-200/70 pt-5 pb-22 lg:pb-5 px-4 text-center text-[11px] text-stone-500">
        © {new Date().getFullYear()} Almoin Crockery. All rights reserved.
      </div>

      {/* Mobile Footer Navigation Bar */}
      <nav
        aria-label="Mobile footer navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_16px_rgba(28,25,23,0.06)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-stretch">
          {MOBILE_FOOTER_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] leading-tight transition ${
                  isActive
                    ? "text-amber-800 font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </footer>
  );
}
