import { getAllOrders } from "@/lib/orders";
import { getProducts } from "@/lib/data/catalog";
import { formatPKR } from "@/lib/utils";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Package,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([
    getAllOrders(),
    getProducts(),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_pkr, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const pendingProofs = orders.filter(
    (o) => o.payment_status === "awaiting_verification"
  );
  const codPendingAmount = orders
    .filter((o) => o.cod_fee_pkr > 0 && o.payment_status === "unpaid")
    .reduce((sum, o) => sum + o.total_pkr, 0);

  // Low stock products (stock <= 25)
  const lowStockVariants: { product: string; sku: string; stock: number }[] = [];
  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stock <= 25) {
        lowStockVariants.push({
          product: p.name,
          sku: v.sku,
          stock: v.stock,
        });
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold">Business Overview</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time sales, courier cash flow, and crockery stock across Pakistan.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-stone-900 text-white dark:bg-amber-700 text-xs font-semibold rounded-lg hover:opacity-90 transition"
          >
            Manage All Orders ({orders.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {formatPKR(totalRevenue)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Lifetime gross volume</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders Count</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {orders.length}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {pendingOrders.length} pending dispatch
          </span>
        </div>

        {/* COD Outstanding */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">COD Outstanding</span>
            <Banknote className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {formatPKR(codPendingAmount)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">To be collected by courier</span>
        </div>

        {/* Pending Payment Proofs */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Payment Proofs</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {pendingProofs.length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Awaiting admin approval
          </span>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-serif font-bold text-base">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-amber-700 hover:underline">
              View All →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No orders placed yet. Place a test order from the storefront.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100 block">
                      {o.order_number}
                    </span>
                    <span className="text-stone-500">
                      {o.shipping_address.recipient_name} • {o.shipping_address.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm">{formatPKR(o.total_pkr)}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 capitalize">
                      {o.status}
                    </span>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded font-semibold text-[11px]"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watch */}
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-base">Stock Threshold Alerts</h3>
          </div>

          <div className="space-y-3">
            {lowStockVariants.slice(0, 5).map((item) => (
              <div key={item.sku} className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">{item.product}</p>
                  <p className="text-stone-400 font-mono text-[10px]">{item.sku}</p>
                </div>
                <span className="px-2 py-1 rounded bg-amber-100 dark:bg-stone-700 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/admin/products"
            className="block text-center text-xs font-semibold text-amber-700 hover:underline pt-2"
          >
            Manage Product Catalog & Stock →
          </Link>
        </div>
      </div>
    </div>
  );
}
