"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import {
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Check,
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

  const addItem = useCartStore((state) => state.addItem);
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    `Hi Almoin Crockery, I have a question about "${product.name}" (${selectedVariant?.title}).`
  )}`;

  return (
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
        </div>

        {/* Subtle Reassurance & Care Specs */}
        <div className="pt-5 border-t border-stone-200/70 space-y-3 text-xs text-stone-500">
          <div className="flex items-center gap-2 text-stone-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Free Transit Breakage Replacement</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
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
  );
}
