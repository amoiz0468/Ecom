"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { ShieldCheck, Star, ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const primaryVariant = product.variants[0];
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (primaryVariant) {
      addItem(product, primaryVariant, 1);
    }
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-lg transition-all duration-300">
      {/* Product Image Link */}
      <Link href={`/product/${product.slug}`} className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Image
          src={product.images[0]?.image_url || "/placeholder.jpg"}
          alt={product.images[0]?.alt_text || product.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900/80 text-amber-300 backdrop-blur-xs">
            {product.material}
          </span>
          {primaryVariant?.compare_at_price && primaryVariant.compare_at_price > primaryVariant.price && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-700 text-white">
              Sale
            </span>
          )}
        </div>

        {/* Breakage Reassurance Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-stone-900/85 text-stone-100 backdrop-blur-xs px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Fragile Transit Safe
          </span>
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Ratings */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300 dark:text-stone-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-500 font-medium">
              ({product.review_count || 12})
            </span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif font-semibold text-stone-900 dark:text-stone-100 text-base line-clamp-1 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Variant piece count hint */}
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
            {hasVariants
              ? `${product.variants.length} options available (${product.variants.map((v) => v.piece_count ? `${v.piece_count} pcs` : v.title).join(", ")})`
              : `${primaryVariant?.piece_count || 1} Piece • ${primaryVariant?.weight_grams || 500}g`}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 text-base">
                {formatPKR(lowestPrice)}
              </span>
              {primaryVariant?.compare_at_price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPKR(primaryVariant.compare_at_price)}
                </span>
              )}
            </div>
            {hasVariants && (
              <span className="text-[10px] text-stone-500 block">Starting price</span>
            )}
          </div>

          {hasVariants ? (
            <Link
              href={`/product/${product.slug}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition"
            >
              Choose Option
            </Link>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-amber-700 hover:opacity-90 transition"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
