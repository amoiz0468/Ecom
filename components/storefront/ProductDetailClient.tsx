"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types";
import { formatPKR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import {
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
} from "lucide-react";

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {}
  );
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.image_url || "/placeholder.jpg"
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567";

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const whatsappMessage = `Hi Khaak & Khazaf, I am interested in purchasing "${product.name}" (${selectedVariant?.title}, SKU: ${selectedVariant?.sku}) for ${formatPKR(selectedVariant?.price || 0)}. Is this in stock for delivery?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const discountPercent =
    selectedVariant?.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compare_at_price - selectedVariant.price) /
            selectedVariant.compare_at_price) *
            100
        )
      : null;

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Fragile Transit Badge */}
            <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Breakage-Free Guarantee
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === img.image_url
                      ? "border-amber-700 ring-2 ring-amber-700/20"
                      : "border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Breakage Promise Box */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-stone-900/60 border border-amber-200/80 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Ceramics Transit Guarantee
            </div>
            <p className="leading-relaxed">
              In the rare event of transit damage, simply record a 30-second unboxing video within 24 hours of receiving the parcel and message us on WhatsApp for an immediate free piece replacement or full refund.
            </p>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-stone-800 px-2.5 py-0.5 rounded">
                  {product.material}
                </span>
                <span className="text-xs text-stone-500 font-medium">SKU: {selectedVariant.sku}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
                {product.name}
              </h1>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
              <span className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                {formatPKR(selectedVariant.price)}
              </span>
              {selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    {formatPKR(selectedVariant.compare_at_price)}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Matrix Selector */}
            {product.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-stone-700 dark:text-stone-300 block">
                  Select Set Option / Size
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`text-left p-3 rounded-lg border text-xs transition relative ${
                          isSelected
                            ? "border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100 ring-2 ring-amber-700/20"
                            : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400"
                        }`}
                      >
                        <div className="font-semibold">{v.title}</div>
                        <div className="text-stone-500 mt-0.5 flex justify-between">
                          <span>{formatPKR(v.price)}</span>
                          <span className="text-[11px]">{v.piece_count} {v.piece_count === 1 ? "Piece" : "Pieces"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock and Shipping Notice */}
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                In Stock ({selectedVariant.stock} units available) • Dispatches within 24 hours
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-4">
                <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                    className="p-3 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg text-sm font-bold text-white transition shadow-sm ${
                    addedAnimation
                      ? "bg-emerald-600"
                      : "bg-stone-900 hover:bg-stone-800 dark:bg-amber-700 dark:hover:bg-amber-600"
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Basket!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Basket ({formatPKR(selectedVariant.price * quantity)})
                    </>
                  )}
                </button>
              </div>

              {/* Direct WhatsApp Ordering */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition"
              >
                <MessageCircle className="w-4 h-4" /> Order or Ask About This Set on WhatsApp
              </a>
            </div>

            {/* Care and Specifications Matrix */}
            <div className="border-t border-stone-200 dark:border-stone-800 pt-6 space-y-3 text-xs">
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Care & Material Specifications
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 flex items-center justify-between">
                  <span>Dishwasher Safe:</span>
                  <strong className={product.care_instructions.dishwasher_safe ? "text-emerald-700" : "text-amber-800"}>
                    {product.care_instructions.dishwasher_safe ? "Yes" : "Handwash Preferred"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 flex items-center justify-between">
                  <span>Microwave Safe:</span>
                  <strong className={product.care_instructions.microwave_safe ? "text-emerald-700" : "text-stone-500"}>
                    {product.care_instructions.microwave_safe ? "Yes" : "No (Gold Embellished)"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 flex items-center justify-between">
                  <span>Piece Weight:</span>
                  <strong>{selectedVariant.weight_grams} grams</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900 flex items-center justify-between">
                  <span>Dimensions:</span>
                  <strong>
                    {selectedVariant.dimensions.length_cm}x{selectedVariant.dimensions.width_cm}x
                    {selectedVariant.dimensions.height_cm} cm
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
