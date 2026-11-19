"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Order, StoreSettings } from "@/types";
import { formatPKR } from "@/lib/utils";
import {
  CheckCircle2,
  MessageCircle,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export function OrderSuccessClient({ order }: { order: Order }) {
  const [proofUrl, setProofUrl] = useState<string | null>(
    order.payment_proof_url || null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    fetch("/api/store-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings) setStoreSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const whatsappNumber =
    storeSettings?.whatsapp_number ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "+923001234567";
  const whatsappMessage = `Assalam-o-Alaikum Almoin Store, I have placed order #${order.order_number} for ${formatPKR(
    order.total_pkr
  )}. Delivery address: ${order.shipping_address.street_address}, ${order.shipping_address.city}.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      fd.append(
        "phone",
        order.guest_info?.phone || order.shipping_address?.phone || ""
      );
      fd.append("file", file);

      const res = await fetch("/api/orders/proof", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload payment receipt.");
      }
      setProofUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload receipt.");
    } finally {
      setUploading(false);
    }
  };

  const bankName = storeSettings?.bank_name || "Meezan Bank Limited";
  const bankTitle = storeSettings?.bank_account_title || "ALMOIN STORE";
  const bankIban = storeSettings?.bank_iban || "PK12MEZN0001020304050607";
  const walletNumber = storeSettings?.jazzcash_number || "03001234567";

  const isManualPayment =
    order.payment_method === "manual_transfer" ||
    order.payment_status === "awaiting_verification" ||
    Boolean(order.notes?.includes("manual_transfer"));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Success Hero Header */}
      <div className="text-center bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Shukriya! Your Order is Placed
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Order Reference: <strong className="text-amber-800 font-mono text-sm">{order.order_number}</strong>
        </p>

        {/* WhatsApp Link Banner */}
        <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Connect on WhatsApp with Order #{order.order_number}
          </a>
          <Link
            href={`/track?order=${order.order_number}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 border border-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-50"
          >
            Track Parcel Status
          </Link>
        </div>
      </div>

      {/* Manual Payment Verification Box */}
      {isManualPayment && (
        <div className="bg-amber-50/80 rounded-2xl p-6 sm:p-8 border border-amber-200 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
              Action Required
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900 mt-2">
              Payment Transfer Details
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Please transfer <strong className="text-stone-900">{formatPKR(order.total_pkr)}</strong> using any of the accounts below:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Bank Card */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block">{bankName}</span>
              <p className="text-stone-500">Title: {bankTitle}</p>
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <span className="truncate">{bankIban}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(bankIban, "iban")}
                  className="p-1 hover:text-amber-700 cursor-pointer"
                  title="Copy IBAN"
                >
                  {copiedField === "iban" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Mobile Wallet */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block">JazzCash / Easypaisa</span>
              <p className="text-stone-500">Title: {bankTitle}</p>
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <span>{walletNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(walletNumber, "wallet")}
                  className="p-1 hover:text-amber-700 cursor-pointer"
                  title="Copy Number"
                >
                  {copiedField === "wallet" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Proof Screenshot Upload */}
          <div className="pt-2 space-y-2">
            <h3 className="text-xs font-bold text-stone-900">
              Upload Transfer Screenshot / Receipt:
            </h3>

            {proofUrl ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 text-xs text-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0">
                    <Image
                      src={proofUrl}
                      alt="Uploaded payment proof"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <strong className="flex items-center gap-1">
                      <FileCheck className="w-4 h-4 text-emerald-600" /> Payment Proof Saved!
                    </strong>
                    <p className="text-[11px] mt-0.5">
                      Uploaded to Cloudinary &amp; linked to order #{order.order_number} for admin verification.
                    </p>
                  </div>
                </div>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline shrink-0"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <label className="border-2 border-dashed border-stone-300 hover:border-amber-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white transition">
                <UploadCloud className="w-8 h-8 text-amber-700 mb-2" />
                <span className="text-xs font-semibold text-stone-800">
                  {uploading
                    ? "Uploading receipt to Cloudinary..."
                    : "Click to upload transfer screenshot"}
                </span>
                <span className="text-[10px] text-stone-400 mt-1">
                  JPG, PNG, or WebP up to 8MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleProofUpload}
                  className="hidden"
                />
              </label>
            )}

            {uploadError && (
              <p className="text-xs text-red-600 font-medium">{uploadError}</p>
            )}
          </div>
        </div>
      )}

      {/* Breakage Notice */}
      <div className="bg-stone-100 rounded-xl p-5 border border-stone-200 flex items-start gap-3 text-xs text-stone-700">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-stone-900">
            Important: 30-Second Unboxing Video Policy
          </strong>
          <p className="mt-0.5 leading-relaxed">
            All crockery pieces are packed in shock-absorbent double-wall cartons. In the rare event of transit crack or breakage, please record an unboxing video when opening the parcel and WhatsApp it to us within 24 hours for a prompt, free piece replacement.
          </p>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
          Delivery & Items Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block mb-0.5">Shipping To:</span>
            <p className="font-semibold text-stone-900">{order.shipping_address.recipient_name}</p>
            <p className="text-stone-600">{order.shipping_address.street_address}</p>
            <p className="text-stone-600">{order.shipping_address.city}, {order.shipping_address.province}</p>
            <p className="text-stone-600">Phone: {order.shipping_address.phone}</p>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Payment Method:</span>
            <p className="font-semibold text-stone-900">
              {order.payment_method === "safepay"
                ? "Online Card / Wallet (Safepay)"
                : order.cod_fee_pkr > 0 || order.payment_method === "cod"
                ? "Cash on Delivery (COD)"
                : "Bank Transfer / JazzCash / Easypaisa"}
            </p>
            <span className="text-stone-400 block mt-2 mb-0.5">Status:</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 capitalize">
              {order.status}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex justify-between text-xs">
              <div>
                <p className="font-semibold text-stone-900">{item.product_title}</p>
                <p className="text-stone-500 text-[11px]">{item.variant_title} x {item.quantity}</p>
              </div>
              <span className="font-bold font-serif">{formatPKR(item.total_pkr)}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
          <span className="font-serif font-bold text-base">Grand Total (PKR)</span>
          <span className="font-serif text-2xl font-bold text-stone-900">
            {formatPKR(order.total_pkr)}
          </span>
        </div>
      </div>
    </div>
  );
}
