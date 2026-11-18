"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { Product } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { QuickViewModal } from "@/components/storefront/QuickViewModal";
import { Plus, Check, Heart, Eye } from "lucide-react";

const DEPT_BADGE: Record<string, string> = {
  crockery: "Crockery",
  boutique: "Boutique",
  shoes: "Shoes",
};

export const ProductCard = memo(function ProductCard({
  product,
}: {
  product: Product;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const primaryVariant =
    product.variants.find((v) => v.stock > 0) || product.variants[0];
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const hasVariants = product.variants.length > 1;
  const isOnSale = Boolean(
    primaryVariant?.compare_at_price &&
      primaryVariant.compare_at_price > primaryVariant.price
  );
  const discountPct =
    isOnSale && primaryVariant?.compare_at_price
      ? Math.round(
          ((primaryVariant.compare_at_price - primaryVariant.price) /
            primaryVariant.compare_at_price) *
            100
        )
      : 0;
  const wishlisted = isInWishlist(product.id);
  const dept = product.store_type || "crockery";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (primaryVariant && primaryVariant.stock > 0) {
      addItem(product, primaryVariant, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  return (
    <>
      <article className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-300">
        {/* Product Photo with Wishlist & Quick View */}
        <div className="relative aspect-square overflow-hidden bg-[#f7f4ee]">
          <Link href={`/product/${product.slug}`} className="relative block w-full h-full">
            <Image
              src={product.images[0]?.image_url || "/logo-card.jpg"}
              alt={product.images[0]?.alt_text || product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
            {isOnSale && discountPct > 0 && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-700 text-white w-fit">
                -{discountPct}%
              </span>
            )}
            <span className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-white/90 text-stone-700 backdrop-blur-xs w-fit">
              {DEPT_BADGE[dept] || "Store"}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-2 rounded-full backdrop-blur-xs shadow-xs transition cursor-pointer ${
                wishlisted
                  ? "bg-amber-800 text-white"
                  : "bg-white/90 text-stone-700 hover:bg-stone-900 hover:text-white"
              }`}
              aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-white" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="p-2 rounded-full bg-white/90 text-stone-700 hover:bg-stone-900 hover:text-white backdrop-blur-xs shadow-xs transition cursor-pointer sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Quick view"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal Details */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5 sm:gap-3">
          <div>
            <p className="text-[10px] sm:text-[11px] text-stone-400 mb-0.5 sm:mb-1 truncate">
              {product.material}
              {dept === "crockery" && primaryVariant?.piece_count
                ? ` • ${primaryVariant.piece_count} ${
                    primaryVariant.piece_count === 1 ? "pc" : "pcs"
                  }`
                : hasVariants
                ? ` • ${product.variants.length} sizes`
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
              <button
                type="button"
                onClick={() => setQuickViewOpen(true)}
                className="shrink-0 text-[11px] sm:text-xs font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition cursor-pointer"
              >
                Options
              </button>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={!primaryVariant || primaryVariant.stock <= 0}
                className={`shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition cursor-pointer ${
                  justAdded
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-900 text-white hover:bg-amber-800 disabled:opacity-40"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3 h-3" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Add
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </article>

      {quickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
});
