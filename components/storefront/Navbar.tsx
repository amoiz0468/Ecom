"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { Product } from "@/types";
import { formatPKR } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
  Home,
  Heart,
} from "lucide-react";

const NAV_CATEGORIES = [
  { name: "All Products", slug: "", href: "/shop" },
  { name: "Dinner Sets", slug: "dinner-sets", href: "/shop?category=dinner-sets" },
  { name: "Bowls", slug: "bowls", href: "/shop?category=bowls" },
  { name: "Cups & Mugs", slug: "cups-mugs", href: "/shop?category=cups-mugs" },
  { name: "Ready-to-Wear Suits", slug: "ready-to-wear-suits", href: "/shop?store=boutique&category=ready-to-wear-suits" },
  { name: "Festive & Formal Pret", slug: "festive-pret", href: "/shop?store=boutique&category=festive-pret" },
  { name: "Heels & Sandals", slug: "heels-sandals", href: "/shop?store=shoes&category=heels-sandals" },
  { name: "Khussas & Flats", slug: "khussas-flats", href: "/shop?store=shoes&category=khussas-flats" },
];

function NavbarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCatParam = searchParams.get("category") || "";
  const activeStoreParam = searchParams.get("store") || "";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [navCategories, setNavCategories] = useState(NAV_CATEGORIES);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const toggleWishlistDrawer = useWishlistStore((state) => state.toggleDrawer);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
    fetch("/api/store-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setNavCategories([
            { name: "All Products", slug: "", href: "/shop" },
            ...data.categories.map((c: { name: string; slug: string }) => ({
              name: c.name,
              slug: c.slug,
              href: `/shop?category=${c.slug}`,
            })),
          ]);
        }
        if (data?.settings?.free_shipping_threshold_pkr) {
          setFreeShippingThreshold(data.settings.free_shipping_threshold_pkr);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, activeCatParam]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Optimized: Only fetch search results when user interacts with search or types a query, with AbortController
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!searchFocused && pathname !== "/shop") return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (searchFocused) {
        setSearchLoading(true);
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(trimmed)}`,
            { signal: controller.signal }
          );
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.products || []);
          }
        } catch {
          // aborted or network error
        } finally {
          setSearchLoading(false);
        }
      }

      if (pathname === "/shop") {
        const currentQ = searchParams.get("q") || "";
        if (currentQ !== trimmed) {
          const params = new URLSearchParams(searchParams.toString());
          if (trimmed) {
            params.set("q", trimmed);
          } else {
            params.delete("q");
          }
          const qs = params.toString();
          router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
        }
      }
    }, 160);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchFocused, pathname, router, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    setMobileMenuOpen(false);
    const trimmed = searchQuery.trim();
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fdfbf7]/95 backdrop-blur-md border-b border-stone-200/70">
      {/* Subtle 1-Line Top Bar */}
      <div className="bg-amber-50/70 text-stone-600 text-[10px] sm:text-[11px] py-1.5 px-3 text-center border-b border-amber-200/40 whitespace-nowrap overflow-hidden text-ellipsis">
        Free Delivery Over{" "}
        <strong className="text-stone-900">
          {formatPKR(freeShippingThreshold)}
        </strong>
        <span className="mx-1.5 sm:mx-2 text-stone-300">&bull;</span>
        <span className="sm:hidden">100% Breakage Guarantee</span>
        <span className="hidden sm:inline">100% Breakage Replacement Guarantee</span>
      </div>

      {/* Clean Single Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-6 h-15 sm:h-[72px]">
          {/* Left: Mobile Menu Button + Transparent Logo & Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-stone-700 hover:bg-stone-100 transition shrink-0 cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 group min-w-0"
            >
              <Image
                src="/logo.png"
                alt="Almoin Store Logo"
                width={44}
                height={53}
                priority
                className="h-10 sm:h-12 w-auto object-contain shrink-0"
              />
              <div className="leading-tight min-w-0">
                <span className="font-serif text-sm sm:text-xl tracking-[0.05em] sm:tracking-[0.06em] text-stone-900 font-semibold group-hover:text-amber-800 transition-colors block truncate">
                  ALMOIN STORE
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-[0.2em] text-stone-500">
                  Crockery • Boutique • Shoes
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clean Real-Time Search Bar */}
          <div
            ref={searchContainerRef}
            className="hidden md:block flex-1 max-w-md relative"
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search crockery, suits, shoes..."
                className="w-full pl-10 pr-9 py-2 rounded-full border border-stone-200 bg-white text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Instant Search Dropdown */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden z-50">
                {searchLoading && searchResults.length === 0 ? (
                  <div className="p-5 text-center text-xs text-stone-400">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-5 text-center text-xs text-stone-500">
                    No items found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {searchResults.map((item) => {
                      const primaryVar = item.variants[0];
                      const minPrice = Math.min(
                        ...item.variants.map((v) => v.price)
                      );
                      const isAdded = justAddedId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="p-2.5 hover:bg-stone-50 flex items-center justify-between gap-3 transition"
                        >
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setSearchFocused(false)}
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                              <Image
                                src={item.images[0]?.image_url || "/logo-card.jpg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-xs text-stone-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-stone-500">
                                {formatPKR(minPrice)}
                              </p>
                            </div>
                          </Link>

                          {primaryVar && (
                            <button
                              type="button"
                              onClick={() => {
                                addItem(item, primaryVar, 1);
                                setJustAddedId(item.id);
                                setTimeout(() => setJustAddedId(null), 1200);
                              }}
                              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1 transition cursor-pointer ${
                                isAdded
                                  ? "bg-emerald-600 text-white"
                                  : "bg-stone-100 hover:bg-amber-700 text-stone-700 hover:text-white"
                              }`}
                            >
                              {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              {isAdded ? "Added" : "Add"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Navigation, Wishlist & Basket */}
          <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
            <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-stone-600">
              <Link
                href="/shop?store=crockery"
                className={`hover:text-stone-900 transition ${
                  pathname === "/shop" && activeStoreParam === "crockery"
                    ? "text-amber-800 font-semibold"
                    : ""
                }`}
              >
                Crockery
              </Link>
              <Link
                href="/shop?store=boutique"
                className={`hover:text-stone-900 transition ${
                  pathname === "/shop" && activeStoreParam === "boutique"
                    ? "text-amber-800 font-semibold"
                    : ""
                }`}
              >
                Boutique
              </Link>
              <Link
                href="/shop?store=shoes"
                className={`hover:text-stone-900 transition ${
                  pathname === "/shop" && activeStoreParam === "shoes"
                    ? "text-amber-800 font-semibold"
                    : ""
                }`}
              >
                Shoes
              </Link>
              <Link
                href="/shop"
                className={`hover:text-stone-900 transition ${
                  pathname === "/shop" && !activeStoreParam
                    ? "text-stone-900 font-semibold"
                    : ""
                }`}
              >
                All
              </Link>
              <Link
                href="/track"
                className={`hover:text-stone-900 transition ${
                  pathname === "/track" ? "text-stone-900 font-semibold" : ""
                }`}
              >
                Track
              </Link>
            </nav>

            <button
              type="button"
              onClick={toggleWishlistDrawer}
              className="relative p-2 rounded-full border border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:text-amber-800 transition cursor-pointer"
              aria-label="Open saved wishlist"
            >
              <Heart className="w-4 h-4" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleCart}
              className="inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-stone-900 text-white hover:bg-amber-800 transition text-xs font-medium cursor-pointer"
              aria-label="Open shopping basket"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Basket</span>
              {mounted && totalItems > 0 && (
                <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crockery, suits, shoes..."
              className="w-full pl-9 pr-8 py-2 rounded-full border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:border-amber-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-0.5 text-stone-400"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Clean Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#fdfbf7] px-4 py-4 space-y-3 shadow-lg max-h-[75vh] overflow-y-auto">
          <div className="rounded-xl border border-stone-200/80 bg-white/70 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-stone-100">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 text-sm font-semibold ${
                  pathname === "/" ? "text-amber-800" : "text-stone-900"
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Home</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileCollectionsOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-stone-500 hover:text-stone-900 px-2 py-1 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                aria-expanded={mobileCollectionsOpen}
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    mobileCollectionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {mobileCollectionsOpen && (
              <div className="p-2 pl-4 space-y-0.5">
                {navCategories.map((cat) => {
                  const isSelected =
                    pathname === "/shop" && activeCatParam === cat.slug;
                  return (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                        isSelected
                          ? "bg-stone-900 text-white font-medium"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <div className="h-20 w-full bg-[#fdfbf7] border-b border-stone-200/70" />
      }
    >
      <NavbarInner />
      <WishlistDrawer />
    </Suspense>
  );
}
