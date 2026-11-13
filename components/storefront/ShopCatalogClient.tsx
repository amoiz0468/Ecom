"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SlidersHorizontal, RotateCcw, X, Check } from "lucide-react";

const MATERIALS = [
  "Bone China",
  "Ceramic",
  "Porcelain",
  "Stoneware",
  "Terracotta",
  "Opal Glass",
];

function filterAndSortProducts(
  products: Product[],
  categories: Category[],
  categorySlug: string,
  material: string,
  query: string,
  sort: string
): Product[] {
  const q = query.trim().toLowerCase();
  const catObj = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  return products
    .filter((p) => {
      if (catObj && p.category_id !== catObj.id) return false;
      if (material && p.material.toLowerCase() !== material.toLowerCase()) {
        return false;
      }
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchMat = p.material.toLowerCase().includes(q);
        const matchSku = p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(q) ||
            v.title.toLowerCase().includes(q)
        );
        if (!matchName && !matchMat && !matchSku) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") {
        return (
          Math.min(...a.variants.map((v) => v.price)) -
          Math.min(...b.variants.map((v) => v.price))
        );
      }
      if (sort === "price-desc") {
        return (
          Math.max(...b.variants.map((v) => v.price)) -
          Math.max(...a.variants.map((v) => v.price))
        );
      }
      if (sort === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      return 0;
    });
}

export function ShopCatalogClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || ""
  );
  const [activeMaterial, setActiveMaterial] = useState(
    searchParams.get("material") || ""
  );
  const [activeSort, setActiveSort] = useState(
    searchParams.get("sort") || ""
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || ""
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Staged draft filters for mobile drawer
  const [draftCategory, setDraftCategory] = useState(activeCategory);
  const [draftMaterial, setDraftMaterial] = useState(activeMaterial);

  useEffect(() => {
    const cat = searchParams.get("category") || "";
    const mat = searchParams.get("material") || "";
    const srt = searchParams.get("sort") || "";
    const q = searchParams.get("q") || "";
    setActiveCategory(cat);
    setActiveMaterial(mat);
    setActiveSort(srt);
    setSearchQuery(q);
    setDraftCategory(cat);
    setDraftMaterial(mat);
  }, [searchParams]);

  const openMobileFilters = () => {
    setDraftCategory(activeCategory);
    setDraftMaterial(activeMaterial);
    setMobileFiltersOpen(true);
  };

  const updateUrlParams = (updates: {
    category?: string;
    material?: string;
    sort?: string;
    q?: string;
  }) => {
    const nextCat =
      updates.category !== undefined ? updates.category : activeCategory;
    const nextMat =
      updates.material !== undefined ? updates.material : activeMaterial;
    const nextSort =
      updates.sort !== undefined ? updates.sort : activeSort;
    const nextQ = updates.q !== undefined ? updates.q : searchQuery;

    setActiveCategory(nextCat);
    setActiveMaterial(nextMat);
    setActiveSort(nextSort);
    setSearchQuery(nextQ);
    setDraftCategory(nextCat);
    setDraftMaterial(nextMat);

    const params = new URLSearchParams();
    if (nextCat) params.set("category", nextCat);
    if (nextMat) params.set("material", nextMat);
    if (nextSort) params.set("sort", nextSort);
    if (nextQ.trim()) params.set("q", nextQ.trim());

    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const applyMobileFilters = () => {
    updateUrlParams({
      category: draftCategory,
      material: draftMaterial,
    });
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetAll = () => {
    setActiveCategory("");
    setActiveMaterial("");
    setActiveSort("");
    setSearchQuery("");
    setDraftCategory("");
    setDraftMaterial("");
    setMobileFiltersOpen(false);
    router.replace("/shop", { scroll: false });
  };

  // Memoized category counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of categories) {
      map.set(
        c.slug,
        initialProducts.filter((p) => p.category_id === c.id).length
      );
    }
    return map;
  }, [categories, initialProducts]);

  // Live filtered products
  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(
        initialProducts,
        categories,
        activeCategory,
        activeMaterial,
        searchQuery,
        activeSort
      ),
    [
      initialProducts,
      categories,
      activeCategory,
      activeMaterial,
      searchQuery,
      activeSort,
    ]
  );

  // Preview count for mobile "Apply Filters (N)" button
  const draftMatchCount = useMemo(
    () =>
      filterAndSortProducts(
        initialProducts,
        categories,
        draftCategory,
        draftMaterial,
        searchQuery,
        activeSort
      ).length,
    [
      initialProducts,
      categories,
      draftCategory,
      draftMaterial,
      searchQuery,
      activeSort,
    ]
  );

  const hasActiveFilters = Boolean(
    activeCategory || activeMaterial || searchQuery.trim()
  );
  const activeFilterCount =
    (activeCategory ? 1 : 0) + (activeMaterial ? 1 : 0);

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.slug === activeCategory)?.name ||
      activeCategory.replace(/-/g, " ")
    : "";

  const pageTitle = activeCategory
    ? activeCategoryName
    : searchQuery.trim()
    ? `Results for "${searchQuery}"`
    : "All Tableware";

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-stone-200/70 pb-4 sm:pb-5 mb-5 sm:mb-8">
        <div className="flex items-baseline gap-2.5 sm:gap-3">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium capitalize text-stone-900">
            {pageTitle}
          </h1>
          <span className="text-xs text-stone-400">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <select
            value={activeSort}
            onChange={(e) => updateUrlParams({ sort: e.target.value })}
            aria-label="Sort products"
            className="flex-1 sm:flex-none text-xs font-medium py-2.5 sm:py-2 px-3.5 rounded-full border border-stone-200 bg-white text-stone-700 focus:outline-none focus:border-stone-900 cursor-pointer"
          >
            <option value="">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          <button
            type="button"
            onClick={openMobileFilters}
            className={`lg:hidden inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-medium cursor-pointer transition ${
              activeFilterCount > 0
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-700"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
      </div>

      {/* Active Filter Chips (1-tap clear on mobile & desktop) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {activeCategory && (
            <button
              type="button"
              onClick={() => updateUrlParams({ category: "" })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-medium cursor-pointer"
            >
              <span>{activeCategoryName}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {activeMaterial && (
            <button
              type="button"
              onClick={() => updateUrlParams({ material: "" })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-medium cursor-pointer"
            >
              <span>{activeMaterial}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => updateUrlParams({ q: "" })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-medium cursor-pointer"
            >
              <span>&ldquo;{searchQuery}&rdquo;</span>
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-amber-800 font-medium hover:underline px-2 py-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile Slide-Up Filter Drawer with Apply Button */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 bg-[#fdfbf7] rounded-t-3xl border-t border-stone-200 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80">
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Filter Tableware
                </h2>
                <p className="text-[11px] text-stone-500">
                  Select options and tap Apply Filters
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-full bg-stone-100 text-stone-700 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2.5">
                  Category
                </p>
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setDraftCategory("")}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition cursor-pointer ${
                      !draftCategory
                        ? "bg-stone-900 text-white font-medium"
                        : "bg-white border border-stone-200/70 text-stone-700"
                    }`}
                  >
                    <span>All Tableware</span>
                    <span className="text-[11px] opacity-60">
                      {initialProducts.length}
                    </span>
                  </button>
                  {categories.map((c) => {
                    const isSelected = draftCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setDraftCategory(c.slug)}
                        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition cursor-pointer ${
                          isSelected
                            ? "bg-stone-900 text-white font-medium"
                            : "bg-white border border-stone-200/70 text-stone-700"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[11px] opacity-60">
                          {categoryCounts.get(c.slug) ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200/70">
                <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2.5">
                  Material
                </p>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map((mat) => {
                    const isSelected =
                      draftMaterial.toLowerCase() === mat.toLowerCase();
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() =>
                          setDraftMaterial(isSelected ? "" : mat)
                        }
                        className={`text-xs px-3.5 py-2 rounded-full border transition cursor-pointer ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-white font-medium"
                            : "border-stone-200 bg-white text-stone-700"
                        }`}
                      >
                        {mat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Apply / Reset Bar */}
            <div className="px-5 py-4 bg-white border-t border-stone-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraftCategory("");
                  setDraftMaterial("");
                }}
                className="px-4 py-3 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyMobileFilters}
                className="flex-1 py-3 px-5 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                Apply Filters ({draftMatchCount}{" "}
                {draftMatchCount === 1 ? "item" : "items"})
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/70 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                Filter
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs text-amber-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="mb-5">
              <p className="text-[11px] text-stone-400 font-medium mb-2">
                Category
              </p>
              <ul className="space-y-0.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => updateUrlParams({ category: "" })}
                    className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg transition cursor-pointer ${
                      !activeCategory
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span>All Tableware</span>
                    <span className="text-[11px] opacity-60">
                      {initialProducts.length}
                    </span>
                  </button>
                </li>
                {categories.map((c) => {
                  const isSelected = activeCategory === c.slug;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => updateUrlParams({ category: c.slug })}
                        className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg transition cursor-pointer ${
                          isSelected
                            ? "bg-stone-900 text-white font-medium"
                            : "text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[11px] opacity-60">
                          {categoryCounts.get(c.slug) ?? 0}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <p className="text-[11px] text-stone-400 font-medium mb-2.5">
                Material
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MATERIALS.map((mat) => {
                  const isSelected =
                    activeMaterial.toLowerCase() === mat.toLowerCase();
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() =>
                        updateUrlParams({ material: isSelected ? "" : mat })
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        isSelected
                          ? "border-stone-900 bg-stone-900 text-white font-medium"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid (2 columns on mobile, 3 on xl) */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-stone-200/70 p-6 sm:p-8">
              {initialProducts.length === 0 ? (
                <>
                  <p className="font-serif text-xl text-stone-800 mb-2">
                    New collections are arriving soon
                  </p>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mb-5 leading-relaxed">
                    Our new tableware collection is being curated. Contact us for custom dinner sets, wedding gifts, or bulk inquiries.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block px-5 py-2.5 rounded-full bg-stone-900 hover:bg-amber-800 text-white text-xs font-medium transition"
                  >
                    Contact Us
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-serif text-xl text-stone-800 mb-2">
                    No matching items found
                  </p>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-3 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-medium cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
