"use client";

import { useState } from "react";
import { DiscountCode } from "@/types";
import { formatPKR } from "@/lib/utils";
import {
  saveDiscountAction,
  toggleDiscountStatusAction,
  deleteDiscountAction,
} from "@/lib/admin/actions";
import { TicketPercent, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

export function AdminDiscountsClient({
  initialDiscounts,
}: {
  initialDiscounts: DiscountCode[];
}) {
  const [discounts, setDiscounts] = useState<DiscountCode[]>(initialDiscounts);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(3000);
  const [usageLimit, setUsageLimit] = useState<number>(200);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    const res = await saveDiscountAction({
      code,
      description,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount_pkr: minOrderAmount,
      usage_limit: usageLimit,
    });
    setSaving(false);
    if (res.success) {
      setDiscounts(res.discounts);
      setCode("");
      setDescription("");
    }
  };

  const handleToggle = async (id: string) => {
    const res = await toggleDiscountStatusAction(id);
    if (res.success) {
      setDiscounts(res.discounts);
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    if (!window.confirm(`Delete coupon "${codeStr}"?`)) return;
    const res = await deleteDiscountAction(id);
    if (res.success) {
      setDiscounts(res.discounts);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Create Coupon Form */}
      <div className="lg:col-span-4">
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl p-6 border border-stone-200/90 space-y-4 text-xs shadow-2xs sticky top-24"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <TicketPercent className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Create Promo Coupon
            </h3>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. EID20 or BRIDAL5000"
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as "percentage" | "fixed")
                }
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {discountType === "percentage" ? "Discount %" : "Amount (PKR)"}
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Min. Order (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Usage Cap
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Campaign Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Festive Eid Dastarkhwan Offer"
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Creating..." : "Activate Coupon Code"}
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs divide-y divide-stone-200">
            <thead className="bg-[#f8f5ef] font-semibold text-stone-600">
              <tr>
                <th className="py-3.5 px-4">Code &amp; Campaign</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Min. Order</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-amber-50/20">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-sm text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                      {d.code}
                    </span>
                    <span className="block text-[11px] text-stone-500 mt-1">
                      {d.description}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-stone-900">
                    {d.discount_type === "percentage"
                      ? `${d.discount_value}% OFF`
                      : `${formatPKR(d.discount_value)} OFF`}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {formatPKR(d.min_order_amount_pkr)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <strong>{d.times_used}</strong>
                    {d.usage_limit ? ` / ${d.usage_limit}` : ""} used
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggle(d.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                        d.is_active
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-stone-100 border-stone-200 text-stone-500"
                      }`}
                    >
                      {d.is_active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Paused
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(d.id, d.code)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-300 transition"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

