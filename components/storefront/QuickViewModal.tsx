"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import {
  Check,
  Heart,
  ShoppingBag,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";

const DEPT_LABEL: Record<string, string> = {
  crockery: "Almoin Crockery",
  boutique: "Ladies Boutique",
  shoes: "Ladies Shoes",
};

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find((v) => v.stock > 0) || product.variants[0]
  );
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const imgUrl = product.images[0]?.image_url || "/logo-card.jpg";
  const dept = product.store_type || "crockery";

  const handleAdd = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem(product, selectedVariant, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl bg-[#fdfbf7] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 text-stone-700 hover:bg-stone-900 hover:text-white transition shadow-xs cursor-pointer"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative aspect-square bg-stone-100">
          <Image
            src={imgUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </div>

        <div className="p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pr-8">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-800">
                {DEPT_LABEL[dept] || "Almoin Store"}
              </span>
              <span className="text-[10px] text-stone-400">
                {product.material}
              </span>
            </div>

            <h3 className="font-serif text-xl font-medium text-stone-900 leading-snug">
              {product.name}
            </h3>

            {selectedVariant && (
              <div className="flex items-baseline gap-2.5">
                <span className="text-lg font-semibold text-stone-900">
                  {formatPKR(selectedVariant.price)}
                </span>
                {selectedVariant.compare_at_price &&
                  selectedVariant.compare_at_price > selectedVariant.price && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatPKR(selectedVariant.compare_at_price)}
                    </span>
                  )}
              </div>
            )}

            <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Variant / Size Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-medium text-stone-600">
                  {dept === "crockery" ? "Set / Option" : "Select Size"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => {
                    const active = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={v.stock <= 0}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-full text-[11px] border transition cursor-pointer ${
                          v.stock <= 0
                            ? "border-stone-200 text-stone-300 line-through cursor-not-allowed"
                            : active
                            ? "border-stone-900 bg-stone-900 text-white font-medium"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {v.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-2 border-t border-stone-200/70">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-stone-900 text-white text-xs font-medium hover:bg-amber-800 disabled:opacity-40 transition cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Basket</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {selectedVariant?.stock > 0
                        ? "Add to Basket"
                        : "Out of Stock"}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full border transition cursor-pointer ${
                  wishlisted
                    ? "border-amber-700 bg-amber-50 text-amber-800"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${wishlisted ? "fill-amber-800" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                {dept === "crockery"
                  ? "100% Breakage Guarantee"
                  : "7-Day Size Exchange"}
              </span>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 font-medium text-stone-900 hover:text-amber-800"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

