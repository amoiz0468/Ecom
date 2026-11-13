import { getAllOrders } from "@/lib/orders";
import { OrdersTableClient } from "@/components/admin/OrdersTableClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Orders &amp; Consignment Dispatch
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Process Cash on Delivery parcels, verify transfers, and assign courier tracking numbers.
        </p>
      </div>

      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
