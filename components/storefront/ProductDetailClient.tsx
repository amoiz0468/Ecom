"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed";
import {
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Check,
  Heart,
  Ruler,
  Share2,
  X,
} from "lucide-react";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.image_url || "/logo-card.jpg"
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { items: recentlyViewed, recordView } = useRecentlyViewedStore();
  const wishlisted = isInWishlist(product.id);
  const dept = product.store_type || "crockery";

  useEffect(() => {
    recordView(product);
  }, [product, recordView]);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        // Fallback to copy
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    `Hi Almoin Store, I have a question about "${product.name}" (${selectedVariant?.title}).`
  )}`;

  const otherRecentlyViewed = recentlyViewed
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Left: Clean Image Gallery */}
      <div className="lg:col-span-7 space-y-3">
        <div className="relative aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-[#f7f4ee] border border-stone-200/70">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>

        {product.images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {product.images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(img.image_url)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border transition shrink-0 cursor-pointer ${
                  selectedImage === img.image_url
                    ? "border-stone-900"
                    : "border-stone-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Calm, Focused Product Details */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-1.5">
            {product.material}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="text-2xl font-semibold text-stone-900">
              {formatPKR(selectedVariant.price)}
            </span>
            {selectedVariant.compare_at_price &&
              selectedVariant.compare_at_price > selectedVariant.price && (
                <span className="text-sm text-stone-400 line-through">
                  {formatPKR(selectedVariant.compare_at_price)}
                </span>
              )}
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">
          {product.description}
        </p>

        {/* Variant Selector */}
        {product.variants.length > 1 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-500 block">
              Select Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                    }`}
                  >
                    <div className="font-medium">{v.title}</div>
                    <div
                      className={`mt-0.5 text-[11px] ${
                        isSelected ? "text-stone-300" : "text-stone-400"
                      }`}
                    >
                      {formatPKR(v.price)} &bull; {v.piece_count}{" "}
                      {v.piece_count === 1 ? "pc" : "pcs"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity + Add to Basket */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center border border-stone-200 rounded-full bg-white">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 text-stone-500 hover:text-stone-900 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-sm font-medium text-stone-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity(Math.min(selectedVariant.stock, quantity + 1))
              }
              className="p-3 text-stone-500 hover:text-stone-900 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-sm font-medium text-white transition cursor-pointer ${
              addedAnimation
                ? "bg-emerald-600"
                : "bg-stone-900 hover:bg-amber-800"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" /> Added to Basket
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Basket
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`p-3.5 rounded-full border transition cursor-pointer ${
              wishlisted
                ? "border-amber-700 bg-amber-50 text-amber-800"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-amber-800" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-3.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:border-stone-400 transition cursor-pointer"
            aria-label="Share product"
            title={copiedLink ? "Link copied!" : "Share product"}
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Subtle Reassurance & Care Specs */}
        <div className="pt-5 border-t border-stone-200/70 space-y-3 text-xs text-stone-500">
          <div className="flex items-center justify-between gap-2 text-stone-700">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {dept === "crockery"
                  ? "100% Free Transit Breakage Replacement"
                  : "7-Day Easy Size Exchange & Quality Guarantee"}
              </span>
            </span>

            {dept !== "crockery" && (
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-amber-800 hover:underline font-medium cursor-pointer shrink-0"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {dept === "crockery" ? (
              <>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  {product.care_instructions.dishwasher_safe
                    ? "Dishwasher Safe"
                    : "Handwash Recommended"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  {product.care_instructions.microwave_safe
                    ? "Microwave Safe"
                    : "Not Microwave Safe"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  {selectedVariant.piece_count}{" "}
                  {selectedVariant.piece_count === 1 ? "Piece" : "Pieces"}
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  {product.material}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                  Cash on Delivery Across Pakistan
                </span>
              </>
            )}
          </div>

          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Ask a question on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>

    {/* Recently Viewed */}
    {otherRecentlyViewed.length > 0 && (
      <section className="mt-12 pt-10 border-t border-stone-200/70">
        <h2 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 mb-5">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {otherRecentlyViewed.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-stone-300 transition"
            >
              <div className="relative aspect-square bg-stone-100 overflow-hidden">
                <Image
                  src={item.images[0]?.image_url || "/logo-card.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <p className="font-serif text-sm font-medium text-stone-900 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {item.variants[0] ? formatPKR(item.variants[0].price) : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )}

    {/* Size Guide Modal for Boutique & Shoes */}
    {sizeGuideOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
          onClick={() => setSizeGuideOpen(false)}
        />
        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-stone-200 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-stone-900">
              {dept === "shoes"
                ? "Ladies Footwear Size Chart"
                : "Ladies Ready-to-Wear Size Chart"}
            </h3>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {dept === "shoes" ? (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2">EU Size</th>
                  <th className="py-2">UK</th>
                  <th className="py-2">US</th>
                  <th className="py-2">Foot Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr><td className="py-2 font-medium">36</td><td>3.5</td><td>6</td><td>23.0 cm</td></tr>
                <tr><td className="py-2 font-medium">37</td><td>4</td><td>6.5</td><td>23.5 cm</td></tr>
                <tr><td className="py-2 font-medium">38</td><td>5</td><td>7.5</td><td>24.2 cm</td></tr>
                <tr><td className="py-2 font-medium">39</td><td>6</td><td>8.5</td><td>25.0 cm</td></tr>
                <tr><td className="py-2 font-medium">40</td><td>6.5</td><td>9</td><td>25.5 cm</td></tr>
                <tr><td className="py-2 font-medium">41</td><td>7.5</td><td>10</td><td>26.2 cm</td></tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest (in)</th>
                  <th className="py-2">Waist (in)</th>
                  <th className="py-2">Shirt Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr><td className="py-2 font-medium">XS</td><td>18&quot;</td><td>16.5&quot;</td><td>37&quot;</td></tr>
                <tr><td className="py-2 font-medium">S</td><td>19&quot;</td><td>17.5&quot;</td><td>38&quot;</td></tr>
                <tr><td className="py-2 font-medium">M</td><td>20.5&quot;</td><td>19&quot;</td><td>39&quot;</td></tr>
                <tr><td className="py-2 font-medium">L</td><td>22.5&quot;</td><td>21&quot;</td><td>40&quot;</td></tr>
                <tr><td className="py-2 font-medium">XL</td><td>24.5&quot;</td><td>23&quot;</td><td>41&quot;</td></tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    )}
    </>
  );
}
