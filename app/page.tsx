import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/data/catalog";
import { SettingsRepository } from "@/lib/db/repositories";
import { formatPKR } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ArrowRight, ShieldCheck, Truck, Sparkles, MessageCircle } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  // Single parallel query instead of redundant catalog fetches
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const storeSettings = SettingsRepository.getStoreSettings();

  const rawFeatured = allProducts.filter((p) => p.is_featured);
  const featuredProducts = (rawFeatured.length > 0 ? rawFeatured : allProducts).slice(0, 4);
  const newArrivals = allProducts.slice(4, 8);
  const heroImageUrl =
    featuredProducts[0]?.images[0]?.image_url ||
    allProducts[0]?.images[0]?.image_url ||
    "/logo-card.jpg";
  const whatsappNumber =
    storeSettings.whatsapp_number ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "+923001234567";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://almoincrockery.pk";
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: storeSettings.store_name || "Almoin Crockery",
    url: baseUrl,
    logo: `${baseUrl}/logo-card.jpg`,
    image: `${baseUrl}/logo-card.jpg`,
    priceRange: "PKR",
    telephone: whatsappNumber,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* 1. Clean, Spacious Hero */}
        <section className="py-12 sm:py-20 border-b border-stone-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs uppercase tracking-[0.22em] text-amber-800 font-medium">
                  Fine Bone China &amp; Ceramics
                </p>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-stone-900 leading-[1.12]">
                  Timeless Tableware for Modern Homes
                </h1>

                <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg">
                  Artisan dinner sets, stoneware bowls, and serving platters—safely delivered across Pakistan with Cash on Delivery.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <Link
                    href="/shop"
                    className="px-6 py-3.5 rounded-full bg-stone-900 hover:bg-amber-800 text-white font-medium text-xs sm:text-sm transition inline-flex items-center gap-2"
                  >
                    Shop Collection <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/shop?category=dinner-sets"
                    className="px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-medium text-xs sm:text-sm transition"
                  >
                    Dinner Sets
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <Link
                  href="/shop"
                  className="block relative aspect-4/3 rounded-3xl overflow-hidden bg-stone-100 shadow-sm group"
                >
                  <Image
                    src={heroImageUrl}
                    alt="Almoin Crockery Fine Tableware"
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Minimal Category Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
              Shop by Category
            </h2>
            <Link
              href="/shop"
              className="text-xs font-medium text-stone-500 hover:text-stone-900 transition"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-2.5 border border-stone-200/60">
                  <Image
                    src={cat.image_url || "/logo-card.jpg"}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 50vw, 16vw"
                  />
                </div>
                <span className="text-sm font-medium text-stone-800 group-hover:text-amber-800 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Bestsellers */}
        <section className="py-16 bg-[#f7f3eb]/60 border-y border-stone-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
                Featured Pieces
              </h2>
              <Link
                href="/shop"
                className="text-xs font-medium text-stone-600 hover:text-stone-900 transition"
              >
                Explore catalog →
              </Link>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-10 text-center max-w-lg mx-auto">
                <p className="font-serif text-xl text-stone-900 mb-2">
                  New collections are arriving soon
                </p>
                <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                  We are curating fresh bone china dinner sets and artisan stoneware. Contact us on WhatsApp for custom sets or advance inquiries.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-amber-800 text-white text-xs font-medium transition"
                >
                  Contact Us <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. Compact 3-Pillar Promise Strip (Clean & Concise) */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-stone-200/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-stone-900">
                  100% Breakage Guarantee
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Free replacement if any piece arrives chipped—just share an unboxing clip.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <Truck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-stone-900">
                  Nationwide Cash on Delivery
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  7-ply cushioned crates shipped across Pakistan. Free over{" "}
                  {formatPKR(storeSettings.free_shipping_threshold_pkr)}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-stone-900">
                  Food-Safe &amp; Lead-Free
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  High-fired bone china and stoneware built for everyday dining.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
                New Arrivals
              </h2>
              <Link
                href="/shop?sort=newest"
                className="text-xs font-medium text-stone-500 hover:text-stone-900 transition"
              >
                See all →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Clean Icon-Only WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
          "Assalam-o-Alaikum Almoin Crockery, I need help choosing tableware."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
      </a>

      <Footer />
    </div>
  );
}
