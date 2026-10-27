"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag, Search, Menu, X, Phone, ShieldCheck, Heart } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const categories = [
    { name: "Dinner Sets", href: "/shop?category=dinner-sets" },
    { name: "Bowls", href: "/shop?category=bowls" },
    { name: "Cups & Mugs", href: "/shop?category=cups-mugs" },
    { name: "Plates & Platters", href: "/shop?category=plates-platters" },
    { name: "Serving Dishes", href: "/shop?category=serving-dishes" },
    { name: "Glassware", href: "/shop?category=glassware" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-950/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Pakistani Market Announcement Bar */}
      <div className="bg-stone-900 text-stone-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Transit Breakage Guarantee
        </span>
        <span className="hidden sm:inline text-stone-500">•</span>
        <span>
          🇵🇰 Free Nationwide Delivery on Orders Over <strong className="text-amber-300">Rs. 5,000</strong>
        </span>
        <span className="hidden md:inline text-stone-500">•</span>
        <span className="hidden md:inline text-stone-300">Cash on Delivery & Bank Transfer</span>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-stone-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Link href="/" className="group flex flex-col items-center lg:items-start">
              <span className="font-serif text-2xl sm:text-3xl tracking-wider text-stone-900 dark:text-stone-100 font-bold group-hover:text-amber-800 transition-colors">
                KHAAK & KHAZAF
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 -mt-1 font-sans">
                Luxury Crockery • Pakistan
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link
              href="/shop"
              className="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              All Crockery
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-amber-800 transition-colors"
              aria-label="Search crockery"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/track"
              className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
            >
              Track Order
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2 text-stone-800 dark:text-stone-100 hover:text-amber-800 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Expansion Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-stone-200 dark:border-stone-800 transition-all">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bone china, dinner sets, soup bowls, kehwa cups..."
                className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                autoFocus
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 bg-stone-900 text-white dark:bg-amber-700 text-xs font-medium rounded-md hover:opacity-90"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-stone-900 dark:text-stone-100 py-1"
          >
            Explore All Crockery
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200 dark:border-stone-800">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-stone-700 dark:text-stone-300 py-1 hover:text-amber-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs text-stone-600 dark:text-stone-400">
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="underline">
              Track Existing Order
            </Link>
            <Link href="/shipping-policy" onClick={() => setMobileMenuOpen(false)} className="underline">
              Breakage Policy
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-stone-500">
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
