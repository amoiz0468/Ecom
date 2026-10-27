import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { ShieldCheck, Video, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "100% Free Transit Breakage Guarantee & Unboxing Policy | Khaak & Khazaf",
  description: "Learn about our breakage replacement guarantee for dinnerware and ceramics across Pakistan.",
};

export default function BreakagePolicyPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            100% Transit Breakage Guarantee
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            We promise peace of mind. Every ceramic, bone china, and porcelain piece is guaranteed against courier damage.
          </p>
        </div>

        {/* 3 Step Claim Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-serif font-bold text-base flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-700" /> Record Unboxing
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              When the courier delivers your box, record a brief 30-second continuous unboxing video showing the outer shipping label and opening of the internal bubble wraps.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-serif font-bold text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Within 24h
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Send the unboxing video and your Order # (e.g. PK-CROCK-10492) to our official WhatsApp helpline at <strong>{whatsappNumber}</strong> within 24 hours of delivery.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-serif font-bold text-base flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" /> Free Replacement
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              We will immediately dispatch a brand-new replacement piece via express courier with zero shipping charges, or issue an immediate refund.
            </p>
          </div>
        </div>

        {/* Packaging Engineering */}
        <div className="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 text-xs text-stone-700 dark:text-stone-300">
          <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
            How We Pack Your Fragile Crockery
          </h2>
          <p className="leading-relaxed">
            Unlike standard retail deliveries, dinner sets and ceramic ware require specialized shock dissipation. Every parcel shipped from our Karachi and Lahore studios uses:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Double-wall 7-ply corrugated cartons:</strong> Rated to withstand up to 45 kg of stacking pressure.</li>
            <li><strong>Custom air-column cushion sleeves:</strong> Surrounding individual plates, bowls, and teapots.</li>
            <li><strong>Biodegradable cornstarch void fillers:</strong> Ensuring zero internal movement or impact between pieces.</li>
            <li><strong>Waterproof heavy-duty strapping tape & prominent Fragile labels.</strong></li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
