import { getProducts, getCategories } from "@/lib/data/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Link from "next/link";
import { Filter, SlidersHorizontal, RotateCcw } from "lucide-react";

interface SearchParamsProps {
  searchParams: Promise<{
    category?: string;
    material?: string;
    sort?: "price-asc" | "price-desc" | "rating" | "newest";
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  const categories = await getCategories();

  const activeCategory = params.category;
  const activeMaterial = params.material;
  const activeSort = params.sort;
  const searchQuery = params.q;

  const products = await getProducts({
    categorySlug: activeCategory,
    material: activeMaterial,
    sort: activeSort,
    query: searchQuery,
  });

  const materials = ["Bone China", "Ceramic", "Porcelain", "Stoneware", "Terracotta", "Opal Glass"];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="text-xs text-stone-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium">All Crockery</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="capitalize text-amber-700 dark:text-amber-400 font-semibold">
                  {activeCategory.replace("-", " ")}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
            <div>
              <h1 className="font-serif text-3xl font-bold capitalize">
                {activeCategory ? activeCategory.replace("-", " ") : "Complete Tableware & Crockery Collection"}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Showing {products.length} exquisite handcrafted and fine china items
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-stone-500">Sort by:</span>
              <form method="GET" action="/shop">
                {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
                {activeMaterial && <input type="hidden" name="material" value={activeMaterial} />}
                {searchQuery && <input type="hidden" name="q" value={searchQuery} />}
                <select
                  name="sort"
                  defaultValue={activeSort || ""}
                  // Using inline form submission on change
                  className="text-xs font-medium py-1.5 px-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none"
                >
                  <option value="">Featured</option>
                  <option value="price-asc">Price: Low to High (PKR)</option>
                  <option value="price-desc">Price: High to Low (PKR)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
                <h3 className="font-serif font-bold text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-700" /> Filter Selection
                </h3>
                {(activeCategory || activeMaterial || searchQuery) && (
                  <Link
                    href="/shop"
                    className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </Link>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-xs uppercase font-semibold text-stone-500 mb-2.5">
                  Category
                </h4>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <Link
                      href="/shop"
                      className={`block py-1 px-2 rounded-md transition ${
                        !activeCategory
                          ? "bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-bold"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                      }`}
                    >
                      All Categories
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/shop?category=${c.slug}${activeMaterial ? `&material=${activeMaterial}` : ""}`}
                        className={`block py-1 px-2 rounded-md transition ${
                          activeCategory === c.slug
                            ? "bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-bold"
                            : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                        }`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Material */}
              <div className="mb-6">
                <h4 className="text-xs uppercase font-semibold text-stone-500 mb-2.5">
                  Material Craft
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {materials.map((mat) => {
                    const isSelected = activeMaterial?.toLowerCase() === mat.toLowerCase();
                    return (
                      <Link
                        key={mat}
                        href={
                          isSelected
                            ? `/shop${activeCategory ? `?category=${activeCategory}` : ""}`
                            : `/shop?material=${encodeURIComponent(mat)}${activeCategory ? `&category=${activeCategory}` : ""}`
                        }
                        className={`text-xs px-2.5 py-1 rounded-md border transition ${
                          isSelected
                            ? "border-amber-700 bg-amber-700 text-white font-medium"
                            : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400"
                        }`}
                      >
                        {mat}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Transit Reassurance Notice */}
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 space-y-1">
                <strong className="block text-stone-800 dark:text-stone-100 font-medium">
                  🚚 Free Shipping Over Rs. 5,000
                </strong>
                <p>All tableware includes custom air-cushioned transit packaging.</p>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8">
                <p className="font-serif text-lg text-stone-700 dark:text-stone-300 mb-2">
                  No tableware found matching your filters.
                </p>
                <p className="text-xs text-stone-500 mb-6">
                  Try clearing your filters or search keywords to view our complete collection.
                </p>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-amber-700 text-white text-xs font-semibold"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
