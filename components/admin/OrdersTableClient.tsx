"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, PaymentStatus, CourierCode } from "@/types";
import { formatPKR } from "@/lib/utils";
import { COURIERS } from "@/lib/couriers";
import {
  updateOrderStatus,
  updateOrderDetailsAction,
  deleteOrderAction,
} from "@/lib/orders";
import { PAKISTAN_CITIES } from "@/lib/data/constants";
import {
  Truck,
  Printer,
  RefreshCw,
  ExternalLink,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
} from "lucide-react";

const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "bg-emerald-50 border-emerald-300 text-emerald-800",
  awaiting_verification: "bg-purple-50 border-purple-300 text-purple-800",
  refunded: "bg-stone-100 border-stone-300 text-stone-700",
  unpaid: "bg-amber-50 border-amber-300 text-amber-800",
};

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

  // Full Order Details Modal state (allowed when order.status !== "delivered")
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestPhone, setEditGuestPhone] = useState("");
  const [editGuestEmail, setEditGuestEmail] = useState("");
  const [editRecipientName, setEditRecipientName] = useState("");
  const [editShippingPhone, setEditShippingPhone] = useState("");
  const [editStreetAddress, setEditStreetAddress] = useState("");
  const [editLandmark, setEditLandmark] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editCourier, setEditCourier] = useState<CourierCode>("tcs");
  const [editTracking, setEditTracking] = useState("");
  const [editOrderStatus, setEditOrderStatus] = useState<OrderStatus>("pending");
  const [editPaymentStatus, setEditPaymentStatus] =
    useState<PaymentStatus>("unpaid");
  const [editShippingFee, setEditShippingFee] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState("");

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

  const handleSaveTracking = async (order: Order) => {
    if (!trackingInput.trim()) return;
    const nextStatus =
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "packed"
        ? "shipped"
        : order.status;
    const updated = await updateOrderStatus(
      order.id,
      nextStatus,
      undefined,
      trackingInput.trim(),
      courierInput
    );
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setEditingOrderId(null);
      setTrackingInput("");
    }
  };

  const openOrderEditor = (order: Order) => {
    if (order.status === "delivered") return;
    setModalOrder(order);
    setDetailsError("");
    setEditGuestName(order.guest_info.name || "");
    setEditGuestPhone(order.guest_info.phone || "");
    setEditGuestEmail(order.guest_info.email || "");
    setEditRecipientName(order.shipping_address.recipient_name || "");
    setEditShippingPhone(order.shipping_address.phone || "");
    setEditStreetAddress(order.shipping_address.street_address || "");
    setEditLandmark(order.shipping_address.landmark || "");
    setEditCity(order.shipping_address.city || "");
    setEditProvince(order.shipping_address.province || "");
    setEditCourier(order.courier_code || "tcs");
    setEditTracking(order.tracking_number || "");
    setEditOrderStatus(order.status);
    setEditPaymentStatus(order.payment_status);
    setEditShippingFee(order.shipping_fee_pkr || 0);
    setEditDiscount(order.discount_pkr || 0);
    setEditNotes(order.notes || "");
  };

  const handleSaveOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalOrder) return;
    setSavingDetails(true);
    setDetailsError("");
    const res = await updateOrderDetailsAction(modalOrder.id, {
      guest_name: editGuestName,
      guest_phone: editGuestPhone,
      guest_email: editGuestEmail,
      recipient_name: editRecipientName,
      shipping_phone: editShippingPhone,
      street_address: editStreetAddress,
      landmark: editLandmark,
      city: editCity,
      province: editProvince,
      courier_code: editCourier,
      tracking_number: editTracking,
      status: editOrderStatus,
      payment_status: editPaymentStatus,
      shipping_fee_pkr: editShippingFee,
      discount_pkr: editDiscount,
      notes: editNotes,
    });
    setSavingDetails(false);
    if (!res.success || !res.order) {
      setDetailsError(res.error || "Failed to save order updates.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === res.order!.id ? res.order! : o))
    );
    setModalOrder(null);
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
                        <select
                          value={order.payment_status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              order.id,
                              order.status,
                              e.target.value as PaymentStatus
                            )
                          }
                          aria-label={`Payment status for ${order.order_number}`}
                          className={`text-[11px] px-2 py-1 rounded-md border font-semibold capitalize cursor-pointer ${
                            PAYMENT_BADGE_CLASS[order.payment_status] ||
                            PAYMENT_BADGE_CLASS.unpaid
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="awaiting_verification">
                            Awaiting Verification
                          </option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
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
                      {editingOrderId === order.id ? (
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
                            onClick={() => handleSaveTracking(order)}
                            className="px-2 py-1 bg-amber-700 text-white rounded text-[10px] cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderId(null);
                              setTrackingInput("");
                            }}
                            className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                            aria-label="Cancel tracking edit"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : order.tracking_number ? (
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-mono text-xs text-stone-800">
                            <span>{order.tracking_number}</span>
                            <span className="block text-[10px] text-stone-500 uppercase">
                              {order.courier_code}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrderId(order.id);
                              setCourierInput(order.courier_code || "tcs");
                              setTrackingInput(order.tracking_number || "");
                            }}
                            className="p-1 text-stone-400 hover:text-amber-800 rounded hover:bg-amber-50 cursor-pointer"
                            title="Edit Courier / Tracking"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setCourierInput(order.courier_code || "tcs");
                            setTrackingInput("");
                          }}
                          className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" /> Assign Tracking
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {order.status !== "delivered" && (
                          <button
                            type="button"
                            onClick={() => openOrderEditor(order)}
                            className="p-1.5 inline-flex items-center gap-1 text-amber-800 hover:bg-amber-50 rounded font-medium cursor-pointer"
                            title="Edit Order Details"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
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

      {/* Edit Order Details Modal (for non-delivered orders) */}
      {modalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
            onClick={() => setModalOrder(null)}
          />
          <form
            onSubmit={handleSaveOrderDetails}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 space-y-5 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Edit Order #{modalOrder.order_number}
                </h2>
                <p className="text-[11px] text-stone-500">
                  Update customer, shipping address, courier, payment, or fee details before delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailsError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {detailsError}
              </div>
            )}

            {/* Customer & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={editGuestName}
                  onChange={(e) => setEditGuestName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Customer Phone
                </label>
                <input
                  type="text"
                  required
                  value={editGuestPhone}
                  onChange={(e) => setEditGuestPhone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={editGuestEmail}
                  onChange={(e) => setEditGuestEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={editRecipientName}
                  onChange={(e) => setEditRecipientName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Delivery Phone
                </label>
                <input
                  type="text"
                  required
                  value={editShippingPhone}
                  onChange={(e) => setEditShippingPhone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={editStreetAddress}
                  onChange={(e) => setEditStreetAddress(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  City
                </label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                >
                  {!PAKISTAN_CITIES.includes(editCity) && editCity && (
                    <option value={editCity}>{editCity}</option>
                  )}
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Province / Landmark
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editProvince}
                    onChange={(e) => setEditProvince(e.target.value)}
                    placeholder="Province"
                    className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                  />
                  <input
                    type="text"
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    placeholder="Landmark"
                    className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>
            </div>

            {/* Courier, Status, Payment & Fees */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Courier
                </label>
                <select
                  value={editCourier}
                  onChange={(e) => setEditCourier(e.target.value as CourierCode)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 uppercase"
                >
                  {Object.keys(COURIERS).map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Tracking #
                </label>
                <input
                  type="text"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  placeholder="Consignment #"
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Order Status
                </label>
                <select
                  value={editOrderStatus}
                  onChange={(e) =>
                    setEditOrderStatus(e.target.value as OrderStatus)
                  }
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Payment Status
                </label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) =>
                    setEditPaymentStatus(e.target.value as PaymentStatus)
                  }
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 capitalize"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="awaiting_verification">
                    Awaiting Verification
                  </option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Shipping Fee (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editShippingFee}
                  onChange={(e) => setEditShippingFee(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Discount (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Recalculated Total
                </label>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 font-serif font-bold text-sm text-amber-900">
                  {formatPKR(
                    Math.max(
                      0,
                      modalOrder.subtotal_pkr -
                        (Number(editDiscount) || 0) +
                        (Number(editShippingFee) || 0) +
                        modalOrder.cod_fee_pkr +
                        modalOrder.fragile_packaging_fee_pkr
                    )
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Order Notes
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Delivery instructions or internal notes..."
                className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setModalOrder(null)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDetails}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-stone-900 hover:bg-amber-800 text-white font-semibold disabled:opacity-50 cursor-pointer"
              >
                {savingDetails ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
