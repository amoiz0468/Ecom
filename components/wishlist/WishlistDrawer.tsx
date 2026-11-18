"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { formatPKR } from "@/lib/utils";
import { Heart, ShoppingBag, Trash2, X } from "lucide-react";

export function WishlistDrawer() {
  const { items, isOpen, closeDrawer, removeFromWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs"
        onClick={closeDrawer}
      />

      <aside className="relative w-full max-w-md bg-[#fdfbf7] text-stone-900 h-full flex flex-col shadow-2xl border-l border-stone-200 z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-800 fill-amber-800" />
            <h2 className="font-serif text-lg font-semibold">
              Saved Wishlist ({items.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif text-lg text-stone-800">
                Your wishlist is empty
              </p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Tap the heart icon on any Crockery, Boutique suit, or Footwear
                piece to save it for later.
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="inline-block mt-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-medium hover:bg-amber-800 transition"
              >
                Explore Store
              </Link>
            </div>
          ) : (
            items.map((product) => {
              const primaryVar =
                product.variants.find((v) => v.stock > 0) ||
                product.variants[0];
              const imgUrl =
                product.images[0]?.image_url || "/logo-card.jpg";

              return (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-white border border-stone-200/80"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={closeDrawer}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0"
                  >
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={closeDrawer}
                        className="text-xs font-semibold text-stone-900 hover:text-amber-800 line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {product.material} •{" "}
                        {primaryVar ? formatPKR(primaryVar.price) : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {primaryVar && primaryVar.stock > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            addItem(product, primaryVar, 1);
                            removeFromWishlist(product.id);
                            closeDrawer();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-900 text-white text-[11px] font-medium hover:bg-amber-800 transition cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Basket</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-1.5 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

