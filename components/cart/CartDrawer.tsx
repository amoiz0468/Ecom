"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPKR } from "@/lib/utils";
import { X, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  // Granular selectors prevent unnecessary re-renders when drawer is closed
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const freeShippingThreshold = 5000;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fdfbf7] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-white">
            <h2 className="text-base font-serif font-medium text-stone-900">
              Basket ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 cursor-pointer"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simple Free Shipping Notice */}
          <div className="bg-amber-50/60 px-6 py-2.5 border-b border-amber-200/40 text-xs text-stone-600 text-center">
            {remaining > 0 ? (
              <>
                Add <strong className="text-stone-900">{formatPKR(remaining)}</strong> more for{" "}
                <strong className="text-stone-900">Free Shipping</strong>
              </>
            ) : (
              <span className="text-emerald-700 font-medium">
                ✓ Free Shipping unlocked
              </span>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 divide-y divide-stone-200/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-8 h-8 text-stone-300 mb-3" />
                <p className="text-sm text-stone-500 mb-5">Your basket is empty</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-medium hover:bg-amber-800 transition"
                >
                  Browse Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variant_id} className="py-4 flex gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70">
                    <Image
                      src={item.product.images[0]?.image_url || "/logo-card.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-medium text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variant_id)}
                        className="text-stone-400 hover:text-stone-700 text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 mb-2 truncate">
                      {item.variant.title}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-200 bg-white rounded-full">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variant_id, item.quantity - 1)
                          }
                          className="p-1.5 text-stone-500 hover:text-stone-900 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variant_id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.variant.stock}
                          className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-stone-900">
                        {formatPKR(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200/80 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-stone-500">Subtotal</span>
                <span className="text-base font-semibold text-stone-900">
                  {formatPKR(subtotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-stone-900 text-white font-medium rounded-full hover:bg-amber-800 transition text-sm"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
