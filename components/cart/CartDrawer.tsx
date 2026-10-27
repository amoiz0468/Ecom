"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPKR } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } =
    useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-stone-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Your Crockery Basket ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-amber-50 dark:bg-stone-800/80 px-4 py-3 border-b border-amber-100 dark:border-stone-800">
            <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              <span>
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add <strong className="text-amber-800 dark:text-amber-400">{formatPKR(remainingForFreeShipping)}</strong> more for <strong>Free Delivery</strong>
                  </>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    ✓ You unlocked FREE Delivery across Pakistan!
                  </span>
                )}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100 dark:divide-stone-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-800 dark:text-stone-200 mb-1">
                  Your basket is empty
                </h3>
                <p className="text-sm text-stone-500 max-w-xs mb-6">
                  Explore our luxury dinner sets, artisan soup bowls, and ceramic platters.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition"
                >
                  <Link href="/shop">Start Shopping</Link>
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variant_id} className="py-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200 dark:border-stone-800">
                    <Image
                      src={item.product.images[0]?.image_url || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 truncate">
                      {item.variant.title}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                          disabled={item.quantity >= item.variant.stock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {formatPKR(item.variant.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.variant_id)}
                          className="text-[11px] text-red-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
              {/* Fragile Transit Notice */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Fragile-Safe Packaging:</strong> Reinforced double-box & air-bubble cushioning included. 100% transit breakage guarantee.
                </p>
              </div>

              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-stone-600 dark:text-stone-400">Subtotal</span>
                <span className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Shipping & Cash on Delivery fee calculated at checkout.
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 dark:bg-amber-700 text-white font-medium rounded-lg hover:opacity-95 transition shadow-sm text-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full block text-center py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:underline"
                >
                  View Full Cart & Shipping Calculator
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
