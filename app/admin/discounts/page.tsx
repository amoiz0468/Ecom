import { getAdminDiscountsAction } from "@/lib/admin/actions";
import { AdminDiscountsClient } from "@/components/admin/AdminDiscountsClient";

export default async function AdminDiscountsPage() {
  const discounts = await getAdminDiscountsAction();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Discount Coupons &amp; Bridal Promotions
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Create percentage or fixed PKR discount codes that customers can apply directly at checkout.
        </p>
      </div>

      <AdminDiscountsClient initialDiscounts={discounts} />
    </div>
  );
}

