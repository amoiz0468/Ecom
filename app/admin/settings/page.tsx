import { getAdminShippingAndSettingsAction } from "@/lib/admin/actions";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const { zones, settings } = await getAdminShippingAndSettingsAction();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Shipping Zones, Bank Accounts &amp; Store Rules
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure Pakistani courier rates, Cash on Delivery limits, Meezan Bank / JazzCash details, and fragile packaging fees.
        </p>
      </div>

      <AdminSettingsClient initialZones={zones} initialSettings={settings} />
    </div>
  );
}

