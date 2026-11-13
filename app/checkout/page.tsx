import { Footer } from "@/components/storefront/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Checkout | Almoin Crockery",
  description: "Fast checkout with Cash on Delivery across Pakistan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900">
      <header className="border-b border-stone-200/80 bg-[#fdfbf7] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo.png"
              alt="Almoin Crockery"
              width={40}
              height={48}
              priority
              className="h-11 w-auto object-contain"
            />
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-[0.06em]">
              ALMOIN CROCKERY
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Secure Checkout
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium mb-6">
          Checkout
        </h1>
        <CheckoutForm />
      </main>

      <Footer />
    </div>
  );
}
