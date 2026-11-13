"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, PaymentStatus, CourierCode } from "@/types";
import { formatPKR } from "@/lib/utils";
import { COURIERS } from "@/lib/couriers";
import { updateOrderStatus, deleteOrderAction } from "@/lib/orders";
import { Truck, Printer, RefreshCw, ExternalLink, Trash2 } from "lucide-react";

export function OrdersTableClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [courierInput, setCourierInput] = useState<CourierCode>("tcs");
  const [refreshing, setRefreshing] = useState(false);

  // Sync when server props update
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Live sync from /api/orders on mount, tab focus, and background interval
  const fetchLatestOrders = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch {
      // ignore transient network errors
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestOrders(false);

    const onFocus = () => fetchLatestOrders(false);
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchLatestOrders(false);
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatestOrders(false);
      }
    }, 8000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [fetchLatestOrders]);

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === "all") return true;
    return o.status === selectedStatus;
  });

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    newPayment?: PaymentStatus
  ) => {
    const updated = await updateOrderStatus(orderId, newStatus, newPayment);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    const updated = await updateOrderStatus(
      orderId,
      "shipped",
      undefined,
      trackingInput.trim(),
      courierInput
    );
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setEditingOrderId(null);
      setTrackingInput("");
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Delete order ${orderNumber}?`)) return;
    const res = await deleteOrderAction(orderId);
    if (res.success) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            "all",
            "pending",
            "confirmed",
            "packed",
            "shipped",
            "delivered",
            "cancelled",
          ].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer ${
                selectedStatus === st
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {st}{" "}
              {st !== "all" &&
                `(${orders.filter((o) => o.status === st).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          <button
            type="button"
            onClick={() => fetchLatestOrders(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No orders found under &ldquo;{selectedStatus}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-stone-200">
              <thead className="bg-stone-50 font-semibold text-stone-600">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer &amp; City</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (PKR)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Courier / Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {order.order_number}
                      <span className="block text-[10px] text-stone-400 font-sans font-normal">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-stone-900 block">
                        {order.shipping_address.recipient_name}
                      </strong>
                      <span className="text-stone-500 text-[11px]">
                        {order.shipping_address.city} &bull;{" "}
                        {order.shipping_address.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-stone-900 block truncate">
                        {order.items[0]?.product_title}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {order.items.length > 1
                          ? `+ ${order.items.length - 1} more piece(s)`
                          : `${order.items[0]?.variant_title || ""} × ${
                              order.items[0]?.quantity || 1
                            }`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-stone-900">
                      {formatPKR(order.total_pkr)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            order.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.payment_status === "awaiting_verification"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.payment_status.replace("_", " ")}
                        </span>
                        {order.payment_proof_url && (
                          <a
                            href={order.payment_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-amber-800 hover:underline font-semibold"
                          >
                            View Receipt <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {order.payment_status === "awaiting_verification" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(order.id, order.status, "paid")
                            }
                            className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                          >
                            Approve Proof
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            order.id,
                            e.target.value as OrderStatus
                          )
                        }
                        className="text-[11px] p-1.5 rounded-md border border-stone-300 bg-white text-stone-800 capitalize font-medium cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      {order.tracking_number ? (
                        <div className="font-mono text-xs text-stone-800">
                          <span>{order.tracking_number}</span>
                          <span className="block text-[10px] text-stone-500 uppercase">
                            {order.courier_code}
                          </span>
                        </div>
                      ) : editingOrderId === order.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={courierInput}
                            onChange={(e) =>
                              setCourierInput(e.target.value as CourierCode)
                            }
                            className="p-1 text-[10px] border border-stone-300 rounded bg-white"
                          >
                            {Object.keys(COURIERS).map((c) => (
                              <option key={c} value={c}>
                                {c.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Tracking #"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="w-24 p-1 text-[11px] border border-stone-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTracking(order.id)}
                            className="px-2 py-1 bg-amber-700 text-white rounded text-[10px] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingOrderId(order.id)}
                          className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" /> Assign Tracking
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          target="_blank"
                          className="p-1.5 inline-flex items-center gap-1 text-stone-600 hover:text-stone-950 rounded hover:bg-stone-100"
                          title="Print Courier Slip & Tax Invoice"
                        >
                          <Printer className="w-4 h-4" /> Slip
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteOrder(order.id, order.order_number)
                          }
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
