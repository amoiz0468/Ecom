import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/data/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ShieldCheck, Truck, Sparkles, CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ featuredOnly: true }),
    getCategories(),
  ]);

  const allProducts = await getProducts();
  const newArrivals = allProducts.slice(4, 8);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-16 sm:py-24 lg:py-32">
          {/* Background Image with Warm Gradient Overlay */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1600"
              alt="Luxury Crockery Dinnerware Setting"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent z-1" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Handcrafted Tableware & Fine Bone China
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100 leading-[1.15]">
                Elevate Every <br />
                <span className="italic font-normal text-amber-400">Dastarkhwan</span> with Timeless Ceramics
              </h1>

              <p className="mt-6 text-base sm:text-lg text-stone-300 leading-relaxed font-light">
                From 24-piece royal Mughal bone china dinner sets to authentic cobalt blue Multani platters. Delivered safely across Pakistan with Cash on Delivery and our 100% Transit Breakage Guarantee.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-6 py-3.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-amber-900/30"
                >
                  Explore Crockery Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/shop?category=dinner-sets"
                  className="px-6 py-3.5 rounded-lg bg-stone-800/90 hover:bg-stone-800 text-stone-200 border border-stone-700 font-medium text-sm transition"
                >
                  Dinner Sets (12 & 24 Pieces)
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="mt-10 pt-6 border-t border-stone-800 flex flex-wrap gap-6 text-xs text-stone-400">
                <span className="flex items-center gap-1.5 text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cash on Delivery Available
                </span>
                <span className="flex items-center gap-1.5 text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Double-Boxed Fragile Packing
                </span>
                <span className="flex items-center gap-1.5 text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Delivery Over Rs. 5,000
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400 font-semibold mb-2">
              Curated Homeware
            </h2>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
              Explore by Category
            </h3>
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
              Each piece is high-fired for heat tolerance, daily durability, and aesthetic elegance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-square bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 flex flex-col justify-end p-4 hover:shadow-md transition"
              >
                <Image
                  src={cat.image_url || "/placeholder.jpg"}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
                <div className="relative z-10 text-center">
                  <h4 className="font-serif font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-stone-300">Shop Range →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Best Sellers */}
        <section className="py-16 bg-stone-100/60 dark:bg-stone-900/40 border-y border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 font-semibold block mb-1">
                  Customer Favorites
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
                  Best Selling Tableware
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-sm font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                View Complete Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Fragile Transit Guarantee Banner */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-stone-100 p-8 sm:p-12 border border-amber-900/40 shadow-xl relative overflow-hidden">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Transit Safety Guarantee
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4 text-stone-50">
                Concerned About Breakage During Courier Delivery?
              </h3>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed mb-6">
                We understand ceramics are precious. Every item is packed in <strong>custom multi-layered bubble wrap, styrofoam corner molds, and heavy-duty double-wall corrugated cartons</strong>. If any piece arrives cracked or broken, simply record a 30-second unboxing video and WhatsApp it to us. We will ship a brand-new replacement piece immediately with zero hassle.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/breakage-policy"
                  className="px-5 py-2.5 rounded-lg bg-stone-100 text-stone-900 text-xs font-bold hover:bg-white transition"
                >
                  Read Our Breakage Policy
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                    "Hi! I have a question about how your crockery is packed and shipped."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 transition inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Ask Packaging Questions on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                New Arrivals
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Handpicked recent studio releases and seasonal dinner sets.
              </p>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline"
            >
              See All New →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
          "Hi Khaak & Khazaf, I am browsing your crockery website and need assistance."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <Footer />
    </div>
  );
}
