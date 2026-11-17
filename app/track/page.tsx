"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trackOrderAction } from "@/lib/orders";
import { Order, OrderStatus } from "@/types";
import { formatPKR } from "@/lib/utils";
import { getCourier } from "@/lib/couriers";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  Search,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get("order") || "";

  const [orderQuery, setOrderQuery] = useState(initialOrderParam);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const runLookup = async (query: string, phone: string) => {
    if (!query.trim() || !phone.trim()) return;
    setLoading(true);
    setSearched(true);
    setErrorMsg("");
    try {
      const res = await trackOrderAction(query.trim(), phone.trim());
      if (res.error) setErrorMsg(res.error);
      setOrder(res.order);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOrderQuery(initialOrderParam);
  }, [initialOrderParam]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runLookup(orderQuery, phoneQuery);
  };

  const steps: { key: OrderStatus; label: string }[] = [
    { key: "pending", label: "Order Received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "packed", label: "Fragile Packed" },
    { key: "shipped", label: "Handed to Courier" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "packed":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const courierInfo = order ? getCourier(order.courier_code) : null;
  const trackingLink =
    order?.tracking_number && courierInfo
      ? courierInfo.getTrackingUrl(order.tracking_number)
      : null;

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-amber-800 font-semibold block mb-1">
          Nationwide Logistics Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold mb-2">
          Track Your Tableware Parcel
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Enter your order reference (e.g. PK-CROCK-10492) to view real-time warehouse &amp; courier status.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row max-w-xl mx-auto gap-2">
          <input
            type="text"
            required
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Order # (e.g. PK-CROCK-10492)"
            className="flex-1 text-xs p-3.5 rounded-full border border-stone-300 bg-white uppercase font-mono px-5 focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
          <input
            type="tel"
            required
            value={phoneQuery}
            onChange={(e) => setPhoneQuery(e.target.value)}
            placeholder="Phone (e.g. 0300-1234567)"
            className="flex-1 text-xs p-3.5 rounded-full border border-stone-300 bg-white px-5 focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-4 h-4" /> {loading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {searched && !loading && (
        <div>
          {!order ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
              {errorMsg ||
                `No order found matching "${orderQuery}" and that phone number. Please verify your details or contact us on WhatsApp.`}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-8">
              {/* Order Top Line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <strong className="font-mono text-base text-amber-800">
                    {order.order_number}
                  </strong>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Total &bull; Payment
                  </span>
                  <span className="text-xs font-semibold capitalize">
                    {formatPKR(order.total_pkr)} &bull; {order.payment_status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <div className="flex flex-col gap-3 sm:grid sm:grid-cols-5 sm:gap-1 sm:text-center">
                  {steps.map((s, idx) => {
                    const currentIdx = getStepIndex(order.status);
                    const isComplete = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={s.key}
                        className="flex items-center gap-3 sm:block sm:space-y-2"
                      >
                        <div
                          className={`w-8 h-8 rounded-full shrink-0 sm:mx-auto flex items-center justify-center text-xs font-bold transition ${
                            isComplete
                              ? "bg-amber-700 text-white"
                              : "bg-stone-100 text-stone-400"
                          } ${isCurrent ? "ring-4 ring-amber-700/20" : ""}`}
                        >
                          {isComplete ? "✓" : idx + 1}
                        </div>
                        <span
                          className={`block text-xs sm:text-[10px] ${
                            isComplete
                              ? "font-bold text-stone-900"
                              : "text-stone-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Tracking Details */}
              {order.tracking_number ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Courier Partner:</span>
                    <strong className="text-stone-900">
                      {courierInfo?.name}
                    </strong>
                    <span className="text-stone-500 block text-[11px] mt-0.5">
                      Tracking #: {order.tracking_number}
                    </span>
                  </div>
                  {trackingLink && (
                    <a
                      href={trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white font-medium rounded-full hover:opacity-90"
                    >
                      Live Courier Tracking <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-100 text-xs text-stone-600">
                  Your parcel is currently being prepared and carefully packed in double-wall cartons in our warehouse. The courier tracking consignment number will appear here upon dispatch.
                </div>
              )}

              {/* Breakage Video Reminder */}
              <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>
                  Reminder: Please record a 30-second unboxing video when your parcel arrives to avail of our 100% Free Transit Breakage Guarantee.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf6] text-stone-900 bg-kiln-mesh">
      <Navbar />
      <CartDrawer />
      <Suspense fallback={<div className="flex-1 py-20 text-center text-xs text-stone-500">Loading parcel tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </div>
  );
}
