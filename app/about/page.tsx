import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Almoin Store | Crockery, Ladies Boutique & Shoes Pakistan",
  description:
    "Curated fine crockery, ladies ready-to-wear boutique suits, and handcrafted ladies shoes delivered across Pakistan.",
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
            alt="Almoin Store"
            width={92}
            height={110}
            priority
            className="h-24 w-auto object-contain mx-auto"
          />
          <span className="text-xs uppercase tracking-[0.22em] text-amber-800 font-semibold block">
            Our Story &amp; Craft
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-stone-900">
            Almoin Store
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Three curated stores in one destination: fine crockery, ladies ready-to-wear boutique suits, and handcrafted ladies shoes across Pakistan.
          </p>
        </div>

        <div className="relative aspect-16/9 rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm">
          <Image
            src="/images/catalog/hero-tableware.jpg"
            alt="Almoin Store Collection"
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        <div className="max-w-2xl mx-auto text-sm text-stone-600 leading-relaxed space-y-4">
          <p>
            In Pakistani homes, hospitality and personal style go hand in hand—from festive dining tables to effortless everyday wardrobes.
          </p>
          <p>
            <strong className="text-stone-900">Almoin Store</strong> brings together three dedicated collections under one roof: <strong className="text-stone-900">Almoin Crockery</strong> (fine bone china &amp; stoneware), <strong className="text-stone-900">Almoin Boutique</strong> (ladies ready-to-wear pret suits), and <strong className="text-stone-900">Almoin Shoes</strong> (handcrafted khussas, heels &amp; flats) with nationwide Cash on Delivery.
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
