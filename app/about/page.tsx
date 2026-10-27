import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Khaak & Khazaf Ceramics | Crafting Crockery for Pakistani Homes",
  description: "Blending centuries of pottery heritage with modern fine china for Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400 font-semibold">
            Our Story & Philosophy
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            The Poetry of Earth, Clay, and Dastarkhwan
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
            *Khaak* (Earth) meets *Khazaf* (Pottery). Reviving the timeless dignity of ceramic artistry across Pakistan.
          </p>
        </div>

        <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-stone-200 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200"
            alt="Handcrafted Ceramic Pottery Studio"
            fill
            className="object-cover"
          />
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-5">
          <p>
            In Pakistani culture, the <em>Dastarkhwan</em> is far more than a dining table. It is the sacred sanctuary of hospitality, where families gather over fragrant biryani, steaming nihari, and slow-brewed cardamom chai.
          </p>
          <p>
            Founded in Karachi, <strong>Khaak & Khazaf</strong> was born out of a desire to replace mass-produced synthetic tableware with soulful, high-fired ceramics, translucent bone china, and authentic Multani Kashi glazed platters.
          </p>
          <p>
            Each piece in our collections is crafted using lead-free, non-toxic glazes, high-temperature kilns for chip resistance, and protective packaging engineering so that your heirloom crockery arrives intact at your doorstep anywhere in Pakistan.
          </p>

          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex justify-center">
            <Link
              href="/shop"
              className="px-6 py-3 bg-stone-900 dark:bg-amber-700 text-white rounded-lg text-xs font-semibold hover:opacity-90 inline-flex items-center gap-2"
            >
              Explore Our Collections <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
