import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "Secure Checkout | Khaak & Khazaf Crockery Pakistan",
  description: "Fast guest checkout with Cash on Delivery and safe ceramics delivery across Pakistan.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* Simple Header for High-Conversion Checkout */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wider">
            KHAAK & KHAZAF
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Lock className="w-4 h-4" /> 256-Bit SSL Encrypted Checkout
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold">Checkout</h1>
          <p className="text-xs text-stone-500 mt-1">
            No password needed. Enter your Pakistani shipping address and select payment.
          </p>
        </div>

        <CheckoutForm />
      </main>

      <Footer />
    </div>
  );
}
