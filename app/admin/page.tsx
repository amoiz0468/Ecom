import { getAllOrders } from "@/lib/orders";
import { getProducts } from "@/lib/data/catalog";
import { AnalyticsRepository } from "@/lib/db/repositories";
import { InquiryResolveButton } from "@/components/admin/InquiryResolveButton";
import { formatPKR } from "@/lib/utils";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  Plus,
  Layers,
  TicketPercent,
  Settings,
  Database,
  Activity,
  Package,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [orders, products, analytics] = await Promise.all([
    getAllOrders(),
    getProducts({ includeUnpublished: true }),
    AnalyticsRepository.getDashboardMetrics(),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_pkr, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const pendingProofs = orders.filter(
    (o) => o.payment_status === "awaiting_verification"
  );
  const codPendingAmount = orders
    .filter(
      (o) =>
        o.payment_method === "cod" &&
        o.payment_status === "unpaid" &&
        o.status !== "cancelled"
    )
    .reduce((sum, o) => sum + o.total_pkr, 0);

  // Real low stock products (stock <= 5)
  const lowStockVariants: { product: string; sku: string; stock: number }[] =
    [];
  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stock <= 5) {
        lowStockVariants.push({
          product: p.name,
          sku: v.sku,
          stock: v.stock,
        });
      }
    });
  });

  const openInquiries = analytics.customerInquiries.filter(
    (inq) => inq.status === "unread"
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-2xl font-bold">
              Almoin Store — Live Operations
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              <Database className="w-3 h-3 text-emerald-600" />
              Live SQLite DB
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            100% real-time database metrics, customer orders, inventory counts,
            and inquiries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products?action=new"
            className="px-4 py-2 bg-amber-700 text-white text-xs font-semibold rounded-full hover:bg-amber-800 transition inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white border border-stone-300 text-stone-800 text-xs font-semibold rounded-full hover:border-amber-700 transition"
          >
            Manage Orders ({orders.length})
          </Link>
        </div>
      </div>

      {/* Quick Administrative Modules Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Link
          href="/admin/products"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-600 transition flex items-center justify-between"
        >
          <span className="font-semibold text-stone-800">
            Catalog ({analytics.inventorySummary.total_products} Products /{" "}
            {analytics.inventorySummary.total_units_in_stock} Units)
          </span>
          <span className="text-amber-700">Manage →</span>
        </Link>
        <Link
          href="/admin/categories"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-600 transition flex items-center justify-between"
        >
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-700" /> Categories
          </span>
          <span className="text-amber-700">Edit →</span>
        </Link>
        <Link
          href="/admin/discounts"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-600 transition flex items-center justify-between"
        >
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <TicketPercent className="w-3.5 h-3.5 text-amber-700" /> Promo Coupons
          </span>
          <span className="text-amber-700">Manage →</span>
        </Link>
        <Link
          href="/admin/settings"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-600 transition flex items-center justify-between"
        >
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-amber-700" /> Shipping &amp; Bank
          </span>
          <span className="text-amber-700">Configure →</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Sales
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {formatPKR(totalRevenue)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Active non-cancelled orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Orders Count
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {orders.length}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {pendingOrders.length} pending dispatch
          </span>
        </div>

        {/* COD Outstanding */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              COD Outstanding
            </span>
            <Banknote className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {formatPKR(codPendingAmount)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            To be collected by courier
          </span>
        </div>

        {/* Pending Payment Proofs */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Payment Proofs
            </span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900">
            {pendingProofs.length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            {pendingProofs.length > 0
              ? "Receipts awaiting verification"
              : "All transfer receipts verified"}
          </span>
        </div>
      </div>

      {/* Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif font-bold text-base">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              View All ({orders.length}) →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-500">
              No customer orders yet. Once customers place orders on the
              storefront, they will appear here automatically.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.slice(0, 6).map((o) => (
                <div
                  key={o.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">
                        {o.order_number}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                        {(o.payment_method || "cod").replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-stone-500 block mt-0.5">
                      {o.shipping_address.recipient_name} •{" "}
                      {o.shipping_address.city} ({o.shipping_address.phone})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif font-bold text-sm">
                      {formatPKR(o.total_pkr)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 capitalize">
                      {o.status}
                    </span>
                    {o.payment_proof_url && (
                      <a
                        href={o.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        Receipt <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <Link
                      href={`/admin/orders/${o.id}/invoice`}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded font-semibold text-[11px]"
                    >
                      Packing Slip
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watch */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-base">
              Low Stock Alerts (≤ 5 left)
            </h3>
          </div>

          {products.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No products in catalog yet.{" "}
              <Link
                href="/admin/products?action=new"
                className="text-amber-700 font-semibold underline"
              >
                Add your first product
              </Link>
              .
            </div>
          ) : lowStockVariants.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50/60 rounded-lg border border-emerald-200/60">
              All {analytics.inventorySummary.total_skus} SKUs have healthy
              stock levels (&gt; 5 units).
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockVariants.slice(0, 6).map((item) => (
                <div
                  key={item.sku}
                  className="p-3 rounded-lg bg-stone-50 text-xs flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-stone-900 line-clamp-1">
                      {item.product}
                    </p>
                    <p className="text-stone-400 font-mono text-[10px]">
                      {item.sku}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded font-bold text-xs ${
                      item.stock === 0
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/products"
            className="block text-center text-xs font-semibold text-amber-700 hover:underline pt-2"
          >
            Manage Product Catalog &amp; Stock →
          </Link>
        </div>
      </div>

      {/* Top Selling SKUs & Customer Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling SKUs & Payment Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Package className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif font-bold text-base">
              Top Selling SKUs &amp; Payment Split
            </h3>
          </div>

          {analytics.topSellingSkus.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              Sales breakdown will populate automatically as orders are placed.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="divide-y divide-stone-100">
                {analytics.topSellingSkus.map((sku) => (
                  <div
                    key={sku.sku}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-900">
                        {sku.product_title} ({sku.variant_title})
                      </p>
                      <p className="text-[11px] text-stone-400 font-mono">
                        {sku.sku} • {sku.units_sold} sold
                      </p>
                    </div>
                    <span className="font-serif font-bold text-stone-900">
                      {formatPKR(sku.revenue_pkr)}
                    </span>
                  </div>
                ))}
              </div>

              {analytics.paymentBreakdown.length > 0 && (
                <div className="pt-3 border-t border-stone-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    Revenue by Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {analytics.paymentBreakdown.map((pm) => (
                      <div
                        key={pm.payment_method}
                        className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-xs"
                      >
                        <span className="uppercase font-bold text-[10px] text-stone-500 block">
                          {pm.payment_method.replace("_", " ")} ({pm.order_count}
                          )
                        </span>
                        <span className="font-serif font-bold text-stone-900">
                          {formatPKR(pm.revenue_pkr)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Inquiries from /contact */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <h3 className="font-serif font-bold text-base">
                Customer Inquiries ({openInquiries.length} Open)
              </h3>
            </div>
            <Link
              href="/contact"
              target="_blank"
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Contact Form →
            </Link>
          </div>

          {analytics.customerInquiries.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              No customer inquiries submitted from the Contact page yet.
            </p>
          ) : (
            <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
              {analytics.customerInquiries.slice(0, 6).map((inq) => (
                <div key={inq.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">
                      {inq.name} •{" "}
                      <span className="font-mono text-stone-600">
                        {inq.phone}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold uppercase">
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    {inq.message}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                    <span>
                      {new Date(inq.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://wa.me/${inq.phone.replace(/\D/g, "").replace(/^0/, "92")}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${inq.name}, regarding your inquiry at Almoin Store: `
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        Reply on WhatsApp →
                      </a>
                      <InquiryResolveButton
                        inquiryId={inq.id}
                        status={inq.status}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live SQLite Audit Log Trail */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif font-bold text-base">
              Backend Security &amp; Database Audit Trail
            </h3>
          </div>
          <Link
            href="/api/health"
            target="_blank"
            className="text-[11px] font-mono text-amber-700 hover:underline"
          >
            GET /api/health →
          </Link>
        </div>

        {analytics.recentAuditLogs.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            No audit events recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
            {analytics.recentAuditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[10px] font-bold text-stone-700">
                    {log.action}
                  </span>
                  <span className="text-stone-700">{log.details}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono shrink-0">
                  <span>by {log.actor}</span>
                  <span>
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
