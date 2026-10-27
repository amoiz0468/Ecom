"use client";

import { useState } from "react";
import { getOrderById } from "@/lib/orders";
import { Order, OrderStatus } from "@/types";
import { formatPKR } from "@/lib/utils";
import { getCourier } from "@/lib/couriers";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await getOrderById(orderQuery.trim());
      setOrder(res);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
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
      case "pending": return 0;
      case "confirmed": return 1;
      case "packed": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      default: return 0;
    }
  };

  const courierInfo = order ? getCourier(order.courier_code) : null;
  const trackingLink = order?.tracking_number && courierInfo ? courierInfo.getTrackingUrl(order.tracking_number) : null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold mb-2">Track Your Tableware Order</h1>
          <p className="text-xs text-stone-500">
            Enter your order reference (e.g. PK-CROCK-10492) to view real-time status.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex max-w-md mx-auto gap-2">
            <input
              type="text"
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. PK-CROCK-10492"
              className="flex-1 text-xs p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 uppercase font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-stone-900 dark:bg-amber-700 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> Track
            </button>
          </form>
        </div>

        {searched && (
          <div>
            {!order ? (
              <div className="text-center p-8 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
                No order found matching &quot;{orderQuery}&quot;. Please verify your reference number or contact us on WhatsApp.
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8">
                {/* Order Top Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Order Reference</span>
                    <strong className="font-mono text-base text-amber-800 dark:text-amber-400">{order.order_number}</strong>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Payment</span>
                    <span className="text-xs font-semibold capitalize">{order.payment_status.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {steps.map((s, idx) => {
                      const currentIdx = getStepIndex(order.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={s.key} className="space-y-2">
                          <div
                            className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition ${
                              isComplete
                                ? "bg-amber-700 text-white"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                            } ${isCurrent ? "ring-4 ring-amber-700/20" : ""}`}
                          >
                            {isComplete ? "✓" : idx + 1}
                          </div>
                          <span className={`block text-[10px] ${isComplete ? "font-bold text-stone-900 dark:text-stone-100" : "text-stone-400"}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier Tracking Details */}
                {order.tracking_number ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Courier Partner:</span>
                      <strong className="text-stone-900 dark:text-stone-100">{courierInfo?.name}</strong>
                      <span className="text-stone-500 block text-[11px] mt-0.5">Tracking #: {order.tracking_number}</span>
                    </div>
                    {trackingLink && (
                      <a
                        href={trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-amber-700 text-white font-medium rounded-lg hover:opacity-90"
                      >
                        Live Courier Tracking <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-300">
                    Your parcel is currently being prepared and carefully packed in double-wall cartons in our warehouse. The courier tracking consignment number will appear here upon dispatch.
                  </div>
                )}

                {/* Breakage Video Reminder */}
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5">
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

      <Footer />
    </div>
  );
}
