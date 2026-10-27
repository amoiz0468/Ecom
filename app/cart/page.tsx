"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPKR } from "@/lib/utils";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTotalWeightGrams } =
    useCartStore();

  const subtotal = getSubtotal();
  const totalWeight = getTotalWeightGrams();
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold mb-2">Shopping Basket</h1>
        <p className="text-xs text-stone-500 mb-8">
          Review your dinnerware pieces, quantities, and transit protection before checkout.
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">Your basket is currently empty</h2>
            <p className="text-xs text-stone-500 mb-6">
              Explore our luxury dinner sets, ceramic tea sets, and hand-painted platters.
            </p>
            <Link
              href="/shop"
              className="px-6 py-3 rounded-lg bg-stone-900 dark:bg-amber-700 text-white font-medium text-xs hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden shadow-xs">
                {items.map((item) => (
                  <div key={item.variant_id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200 dark:border-stone-800">
                      <Image
                        src={item.product.images[0]?.image_url || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link href={`/product/${item.product.slug}`} className="hover:underline">
                            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {item.variant.title} • {item.variant.sku}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.variant_id)}
                          className="text-stone-400 hover:text-red-600 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800">
                          <button
                            onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                            className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-stone-900 dark:text-stone-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                            className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                            disabled={item.quantity >= item.variant.stock}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                            {formatPKR(item.variant.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-stone-400 block">
                              {formatPKR(item.variant.price)} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-stone-500 px-2">
                <span>Calculated parcel weight: <strong>{(totalWeight / 1000).toFixed(1)} kg</strong></span>
                <button onClick={clearCart} className="hover:text-red-600 underline">
                  Empty basket
                </button>
              </div>
            </div>

            {/* Summary & Checkout */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-800">
                  Order Summary
                </h2>

                <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <strong className="text-stone-900 dark:text-stone-100">{formatPKR(subtotal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="text-stone-500">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash on Delivery (COD)</span>
                    <span className="text-stone-500">Available</span>
                  </div>
                </div>

                {remainingForFreeShipping > 0 ? (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-stone-800/80 text-xs text-stone-700 dark:text-stone-300">
                    Add <strong className="text-amber-800 dark:text-amber-400">{formatPKR(remainingForFreeShipping)}</strong> more to qualify for <strong>FREE Nationwide Delivery</strong>!
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    ✓ You qualify for FREE Nationwide Delivery across Pakistan.
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline">
                  <span className="font-serif font-bold text-base">Estimated Total</span>
                  <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {formatPKR(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-stone-900 dark:bg-amber-700 text-white font-semibold rounded-lg hover:opacity-95 transition text-sm shadow-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Fragile Reassurance */}
                <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Every package is double-boxed with heavy bubble wrap and protected by our 100% free breakage replacement policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
