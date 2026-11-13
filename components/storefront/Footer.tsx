"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_CATEGORIES } from "@/lib/data/constants";

export function Footer() {
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

      <div className="border-t border-stone-200/70 py-5 px-4 text-center text-[11px] text-stone-500">
        © {new Date().getFullYear()} Almoin Crockery. All rights reserved.
      </div>
    </footer>
  );
}
