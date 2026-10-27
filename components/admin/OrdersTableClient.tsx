"use client";

import { useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, PaymentStatus, CourierCode } from "@/types";
import { formatPKR } from "@/lib/utils";
import { COURIERS } from "@/lib/couriers";
import { updateOrderStatus } from "@/lib/orders";
import {
  FileText,
  Truck,
  CheckCircle,
  ExternalLink,
  Printer,
  ChevronDown,
} from "lucide-react";

export function OrdersTableClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [courierInput, setCourierInput] = useState<CourierCode>("tcs");

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
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    const updated = await updateOrderStatus(orderId, "shipped", undefined, trackingInput.trim());
    if (updated) {
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      setEditingOrderId(null);
      setTrackingInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {["all", "pending", "confirmed", "packed", "shipped", "delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                selectedStatus === st
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              {st} {st !== "all" && `(${orders.filter((o) => o.status === st).length})`}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No orders found under &quot;{selectedStatus}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-stone-200 dark:divide-stone-800">
              <thead className="bg-stone-50 dark:bg-stone-800/60 font-semibold text-stone-600 dark:text-stone-300">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (PKR)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Courier / Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800 dark:text-amber-400">
                      {order.order_number}
                      <span className="block text-[10px] text-stone-400 font-sans font-normal">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-stone-900 dark:text-stone-100 block">
                        {order.shipping_address.recipient_name}
                      </strong>
                      <span className="text-stone-500 text-[11px]">
                        {order.shipping_address.city} • {order.shipping_address.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold block truncate">
                        {order.items[0]?.product_title}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {order.items.length > 1
                          ? `+ ${order.items.length - 1} more crockery piece(s)`
                          : `${order.items[0]?.variant_title}`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-serif font-bold text-sm">
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
                        {order.payment_status === "awaiting_verification" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, order.status, "paid")}
                            className="text-[10px] text-emerald-700 hover:underline font-semibold"
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
                          handleUpdateStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="text-[11px] p-1.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 capitalize font-medium"
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
                        <div className="font-mono text-xs text-stone-800 dark:text-stone-200">
                          <span>{order.tracking_number}</span>
                          <span className="block text-[10px] text-stone-500 uppercase">
                            {order.courier_code}
                          </span>
                        </div>
                      ) : editingOrderId === order.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Tracking #"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="w-24 p-1 text-[11px] border rounded"
                          />
                          <button
                            onClick={() => handleSaveTracking(order.id)}
                            className="px-2 py-1 bg-amber-700 text-white rounded text-[10px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingOrderId(order.id)}
                          className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" /> Assign Tracking
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}/invoice`}
                        target="_blank"
                        className="p-1.5 inline-flex items-center gap-1 text-stone-600 hover:text-stone-950 dark:hover:text-stone-100 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Print Courier Slip & Tax Invoice"
                      >
                        <Printer className="w-4 h-4" /> Slip
                      </Link>
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
