"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPKR, normalizePakistaniPhone } from "@/lib/utils";
import { PAKISTAN_CITIES } from "@/lib/data/mock-catalog";
import { placeOrder } from "@/lib/orders";
import { PaymentProviderId } from "@/types";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRight,
  AlertCircle,
  Tag,
  Check,
} from "lucide-react";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, getSubtotal, getTotalWeightGrams } = useCartStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Karachi");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [province, setProvince] = useState("Sindh");
  const [paymentMethod, setPaymentMethod] = useState<PaymentProviderId>("cod");
  const [extraPackaging, setExtraPackaging] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const subtotal = getSubtotal();
  const totalWeight = getTotalWeightGrams();

  // Dynamic shipping calculation
  const shippingFee = subtotal >= 5000 ? 0 : city === "Karachi" ? 200 : 280;
  const codFee = paymentMethod === "cod" ? 150 : 0;
  const fragileFee = extraPackaging ? 250 : 0;
  const discountAmount = appliedDiscount || 0;
  const total = subtotal - discountAmount + shippingFee + codFee + fragileFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === "WELCOME10") {
      const disc = Math.round(subtotal * 0.1);
      setAppliedDiscount(disc);
      setDiscountError("");
    } else {
      setDiscountError("Invalid coupon code. Try WELCOME10 for 10% off.");
      setAppliedDiscount(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !phone.trim() || !streetAddress.trim() || !city) {
      setFormError("Please fill in all mandatory delivery details.");
      return;
    }

    const phoneValidation = normalizePakistaniPhone(phone);
    if (!phoneValidation.isValid) {
      setFormError("Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567).");
      return;
    }

    if (items.length === 0) {
      setFormError("Your basket is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await placeOrder({
        guestInfo: { name, email: email || "customer@khaak-khazaf.pk", phone },
        shippingAddress: {
          recipient_name: name,
          phone,
          street_address: streetAddress,
          landmark,
          city,
          province,
        },
        paymentMethod,
        extraPackaging,
        notes,
        items,
        discountCode: appliedDiscount ? "WELCOME10" : undefined,
      });

      if (!res.success || !res.order) {
        setFormError(res.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(res.redirectUrl || `/checkout/success/${res.order.id}`);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Left Column: Delivery & Payment Details */}
      <div className="lg:col-span-7 space-y-8">
        {/* Contact Information */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            1. Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayesha Khan"
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Mobile Number (Pakistani format) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Courier rider calls this number for doorstep delivery.
              </span>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Email Address (For receipt & tracking)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ayesha@example.com"
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address in Pakistan */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            2. Delivery Address (Pakistan)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (["Karachi", "Hyderabad", "Sukkur"].includes(e.target.value)) setProvince("Sindh");
                  else if (["Lahore", "Rawalpindi", "Faisalabad", "Multan", "Sialkot", "Gujranwala"].includes(e.target.value)) setProvince("Punjab");
                  else if (["Islamabad"].includes(e.target.value)) setProvince("Federal");
                  else if (["Peshawar", "Mardan", "Abbottabad"].includes(e.target.value)) setProvince("KPK");
                  else if (["Quetta"].includes(e.target.value)) setProvince("Balochistan");
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              >
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Province / Region *
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Complete Street Address (House #, Street/Lane, Block/Phase) *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House # 12, Street 4, Phase 6, DHA"
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Famous Landmark / Nearest Area (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Jamia Mosque / Commercial Market"
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fragile Packaging Add-on */}
        <div className="bg-amber-50/70 dark:bg-stone-900/80 rounded-xl p-5 border border-amber-200 dark:border-stone-800 flex items-start gap-3">
          <input
            type="checkbox"
            id="packaging"
            checked={extraPackaging}
            onChange={(e) => setExtraPackaging(e.target.checked)}
            className="mt-1 h-4 w-4 rounded text-amber-700 focus:ring-amber-700"
          />
          <label htmlFor="packaging" className="text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
            <span className="font-bold text-stone-900 dark:text-stone-100 block">
              Heavy-Duty Air-Column & Double-Wall Safe Packaging (+Rs. 250)
            </span>
            Recommended for dinner sets and fragile bone china to guarantee zero breakage during long-distance courier transit.
          </label>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            3. Payment Method
          </h2>

          <div className="space-y-3">
            {/* COD */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                paymentMethod === "cod"
                  ? "border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-700/20"
                  : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="mt-1 text-amber-700 focus:ring-amber-700"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">+Rs. 150 COD Fee</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Pay cash to the courier upon delivery. Max order value Rs. 35,000.
                </p>
              </div>
            </label>

            {/* Manual Bank / JazzCash / Easypaisa */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                paymentMethod === "manual_transfer"
                  ? "border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-700/20"
                  : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="manual_transfer"
                checked={paymentMethod === "manual_transfer"}
                onChange={() => setPaymentMethod("manual_transfer")}
                className="mt-1 text-amber-700 focus:ring-amber-700"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-600" /> Bank Transfer / JazzCash / Easypaisa
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">No COD Fee</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Meezan Bank, Bank Alfalah, JazzCash, or Easypaisa. Upload screenshot on next screen.
                </p>
              </div>
            </label>

            {/* Safepay Pakistani Gateway (Sandbox) */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                paymentMethod === "safepay"
                  ? "border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-700/20"
                  : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="safepay"
                checked={paymentMethod === "safepay"}
                onChange={() => setPaymentMethod("safepay")}
                className="mt-1 text-amber-700 focus:ring-amber-700"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" /> Online Card / Wallet (Safepay Pakistan)
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">Instant</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Visa, Mastercard, PayPak. Secure checkout with 3D Secure verification.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
            Order Notes / Delivery Instructions (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please deliver between 2 PM - 6 PM, or call on alternate number."
            className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Column: Order Summary & Review */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 sticky top-24">
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-800">
            Order Review ({items.length} items)
          </h2>

          {/* Mini Items List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 pr-1">
            {items.map((i) => (
              <div key={i.variant_id} className="py-2.5 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <Image
                    src={i.product.images[0]?.image_url || "/placeholder.jpg"}
                    alt={i.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {i.product.name}
                  </p>
                  <p className="text-stone-500 text-[11px] truncate">
                    {i.variant.title} x {i.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold font-serif text-stone-900 dark:text-stone-100">
                  {formatPKR(i.variant.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Discount code (e.g. WELCOME10)"
                className="flex-1 text-xs p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-lg hover:bg-stone-700 transition"
              >
                Apply
              </button>
            </div>
            {appliedDiscount && (
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                ✓ Coupon WELCOME10 applied (10% off)!
              </span>
            )}
            {discountError && (
              <span className="text-[11px] text-red-600 block mt-1">{discountError}</span>
            )}
          </div>

          {/* Calculation Breakdown */}
          <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong className="text-stone-900 dark:text-stone-100">{formatPKR(subtotal)}</strong>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <strong>-{formatPKR(appliedDiscount)}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping to {city}</span>
              <strong className={shippingFee === 0 ? "text-emerald-600 font-bold" : "text-stone-900 dark:text-stone-100"}>
                {shippingFee === 0 ? "FREE" : formatPKR(shippingFee)}
              </strong>
            </div>
            {paymentMethod === "cod" && (
              <div className="flex justify-between">
                <span>Cash on Delivery Handling</span>
                <strong className="text-stone-900 dark:text-stone-100">{formatPKR(codFee)}</strong>
              </div>
            )}
            {extraPackaging && (
              <div className="flex justify-between">
                <span>Extra Protective Fragile Packaging</span>
                <strong className="text-stone-900 dark:text-stone-100">{formatPKR(fragileFee)}</strong>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline">
            <span className="font-serif font-bold text-base">Grand Total (PKR)</span>
            <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              {formatPKR(total)}
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Order */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-lg transition text-sm shadow-md"
          >
            {isSubmitting ? (
              "Processing Order..."
            ) : (
              <>
                Place Order ({formatPKR(total)}) <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Safety Reassurance */}
          <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-300 space-y-1">
            <div className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Breakage-Free Transit Guarantee
            </div>
            <p>
              Free replacement guaranteed in case of transit cracks. Please record a 30s unboxing video upon courier receipt.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
