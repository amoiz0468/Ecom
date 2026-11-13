"use client";

import { useState } from "react";
import { ShippingZone, StoreSettings } from "@/types";
import { formatPKR } from "@/lib/utils";
import {
  updateShippingZoneAction,
  updateStoreSettingsAction,
} from "@/lib/admin/actions";
import { Truck, Landmark, ShieldCheck, Check } from "lucide-react";

export function AdminSettingsClient({
  initialZones,
  initialSettings,
}: {
  initialZones: ShippingZone[];
  initialSettings: StoreSettings;
}) {
  const [zones, setZones] = useState<ShippingZone[]>(initialZones);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [savedBanner, setSavedBanner] = useState("");

  const handleZoneChange = (
    zoneId: string,
    field: keyof ShippingZone,
    value: number
  ) => {
    setZones(
      zones.map((z) => (z.id === zoneId ? { ...z, [field]: value } : z))
    );
  };

  const handleSaveZone = async (zone: ShippingZone) => {
    const res = await updateShippingZoneAction(zone.id, {
      base_rate_pkr: zone.base_rate_pkr,
      per_kg_extra_pkr: zone.per_kg_extra_pkr,
      free_shipping_threshold_pkr: zone.free_shipping_threshold_pkr,
      cod_fee_pkr: zone.cod_fee_pkr,
    });
    if (res.success) {
      setZones(res.zones);
      setSavedBanner(`Updated shipping rates for ${zone.zone_name}`);
      setTimeout(() => setSavedBanner(""), 2500);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateStoreSettingsAction(settings);
    if (res.success) {
      setSettings(res.settings);
      setSavedBanner("Saved store bank, wallet, and COD settings!");
      setTimeout(() => setSavedBanner(""), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> {savedBanner}
        </div>
      )}

      {/* 1. Pakistani City Shipping Zones */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
          <Truck className="w-5 h-5 text-amber-700" />
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Pakistani Courier Shipping Zones &amp; Weight Rates
            </h3>
            <p className="text-xs text-stone-500">
              Configure base 1kg rates and per-kg extra stoneware/porcelain charges across Pakistan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((z) => (
            <div
              key={z.id}
              className="p-4 rounded-2xl bg-[#f8f5ef] border border-stone-200/80 space-y-3 text-xs"
            >
              <div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  {z.zone_name}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {z.cities.length > 0
                    ? z.cities.join(", ")
                    : "All other cities & towns"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                    Base 1kg Rate (PKR)
                  </label>
                  <input
                    type="number"
                    value={z.base_rate_pkr}
                    onChange={(e) =>
                      handleZoneChange(z.id, "base_rate_pkr", Number(e.target.value))
                    }
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                    Extra per Kg (PKR)
                  </label>
                  <input
                    type="number"
                    value={z.per_kg_extra_pkr}
                    onChange={(e) =>
                      handleZoneChange(
                        z.id,
                        "per_kg_extra_pkr",
                        Number(e.target.value)
                      )
                    }
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveZone(z)}
                className="w-full py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition"
              >
                Update Zone Rate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bank Transfer, JazzCash, Easypaisa & COD Limits */}
      <form
        onSubmit={handleSaveSettings}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs"
      >
        {/* Bank & Mobile Wallet Accounts */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Landmark className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Bank Transfer &amp; Mobile Wallet Accounts
            </h3>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.bank_name}
              onChange={(e) =>
                setSettings({ ...settings, bank_name: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Account Title
            </label>
            <input
              type="text"
              value={settings.bank_account_title}
              onChange={(e) =>
                setSettings({ ...settings, bank_account_title: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Pakistani IBAN Number
            </label>
            <input
              type="text"
              value={settings.bank_iban}
              onChange={(e) =>
                setSettings({ ...settings, bank_iban: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                JazzCash Number
              </label>
              <input
                type="text"
                value={settings.jazzcash_number}
                onChange={(e) =>
                  setSettings({ ...settings, jazzcash_number: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Easypaisa Number
              </label>
              <input
                type="text"
                value={settings.easypaisa_number}
                onChange={(e) =>
                  setSettings({ ...settings, easypaisa_number: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* COD Limits, Fragile Fees & WhatsApp Concierge */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                COD Caps, Packaging Fees &amp; Concierge
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Free Shipping Threshold (PKR)
                </label>
                <input
                  type="number"
                  value={settings.free_shipping_threshold_pkr}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      free_shipping_threshold_pkr: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Max COD Order Cap (PKR)
                </label>
                <input
                  type="number"
                  value={settings.max_cod_limit_pkr}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_cod_limit_pkr: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  COD Handling Fee (PKR)
                </label>
                <input
                  type="number"
                  value={settings.cod_fee_pkr}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cod_fee_pkr: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  7-Ply Fragile Add-On (PKR)
                </label>
                <input
                  type="number"
                  value={settings.fragile_packaging_fee_pkr}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fragile_packaging_fee_pkr: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Official WhatsApp Number
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_number: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.store_email}
                  onChange={(e) =>
                    setSettings({ ...settings, store_email: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold transition shadow-xs"
          >
            Save All Store Configuration
          </button>
        </div>
      </form>
    </div>
  );
}

