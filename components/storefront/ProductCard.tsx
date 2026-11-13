"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { Product } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { Plus, Check } from "lucide-react";

export const ProductCard = memo(function ProductCard({
  product,
}: {
  product: Product;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const primaryVariant = product.variants[0];
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;
  const isOnSale = Boolean(
    primaryVariant?.compare_at_price &&
      primaryVariant.compare_at_price > primaryVariant.price
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (primaryVariant) {
      addItem(product, primaryVariant, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  return (
    <article className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-300">
      {/* Uncluttered Product Photo */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-[#f7f4ee]"
      >
        <Image
          src={product.images[0]?.image_url || "/logo-card.jpg"}
          alt={product.images[0]?.alt_text || product.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {isOnSale && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-700 text-white">
            Sale
          </span>
        )}
      </Link>

      {/* Minimal Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
        <div>
          <p className="text-[10px] sm:text-[11px] text-stone-400 mb-0.5 sm:mb-1 truncate">
            {product.material}
            {primaryVariant?.piece_count
              ? ` • ${primaryVariant.piece_count} ${
                  primaryVariant.piece_count === 1 ? "pc" : "pcs"
                }`
              : ""}
          </p>

          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif font-medium text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
              {hasVariants ? `From ${formatPKR(lowestPrice)}` : formatPKR(lowestPrice)}
            </span>
            {!hasVariants && isOnSale && primaryVariant?.compare_at_price && (
              <span className="hidden sm:inline text-xs text-stone-400 line-through">
                {formatPKR(primaryVariant.compare_at_price)}
              </span>
            )}
          </div>

          {hasVariants ? (
            <Link
              href={`/product/${product.slug}`}
              className="shrink-0 text-[11px] sm:text-xs font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition"
            >
              Options
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition cursor-pointer ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-900 text-white hover:bg-amber-800"
              }`}
              aria-label={`Add ${product.name} to basket`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
});
