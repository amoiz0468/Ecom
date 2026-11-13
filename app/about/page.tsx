import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Almoin Crockery | Fine Tableware for Pakistani Homes",
  description: "Crafting timeless bone china, porcelain, and stoneware tableware across Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Image
            src="/logo.png"
            alt="Almoin Crockery"
            width={92}
            height={110}
            priority
            className="h-24 w-auto object-contain mx-auto"
          />
          <span className="text-xs uppercase tracking-[0.22em] text-amber-800 font-semibold block">
            Our Story &amp; Craft
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-stone-900">
            Almoin Crockery
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Bringing refined bone china, artisan stoneware, and heirloom hospitality to dining tables across Pakistan.
          </p>
        </div>

        <div className="relative aspect-16/9 rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm">
          <Image
            src="/logo-card.jpg"
            alt="Almoin Crockery Tableware Craft"
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        <div className="max-w-2xl mx-auto text-sm text-stone-600 leading-relaxed space-y-4">
          <p>
            In Pakistani homes, the dining table is a centerpiece of warmth and hospitality—where families gather over festive dinners, everyday meals, and evening chai.
          </p>
          <p>
            <strong className="text-stone-900">Almoin Crockery</strong> curates fine bone china dinner sets, durable stoneware bowls, and elegant serving platters crafted with food-safe glazes and packed in shock-absorbent cartons for safe nationwide delivery.
          </p>

          <div className="pt-6 flex justify-center">
            <Link
              href="/shop"
              className="px-6 py-3 bg-stone-900 hover:bg-amber-800 text-white rounded-full text-xs font-semibold transition inline-flex items-center gap-2"
            >
              Explore Collections <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
