import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPKR } from "@/lib/utils";
import { ShieldAlert, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const isCOD = order.cod_fee_pkr > 0 && order.payment_status === "unpaid";

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 p-4 sm:p-8 print:p-0 print:bg-white text-stone-900">
      {/* Non-printable action bar */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <button
          onClick={() => {
            // Client-side print trigger
          }}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
        >
          <Printer className="w-4 h-4" /> Print Packing Slip (Ctrl + P)
        </button>
      </div>

      {/* Slip Document */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-stone-300 shadow-sm print:border-none print:shadow-none print:p-2 text-stone-900 text-xs">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-stone-900">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-wider">
              KHAAK & KHAZAF
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-sans">
              Luxury Crockery & Fine Ceramics • Pakistan
            </p>
            <p className="text-[11px] text-stone-600 mt-1">
              Fulfillment Hub: Plot 18-C, Korangi Industrial Area, Karachi, Pakistan
            </p>
            <p className="text-[11px] text-stone-600">
              Helpline: {process.env.NEXT_PUBLIC_STORE_PHONE || "+92 21 35812345"} • WhatsApp: {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Courier Packing Slip & Tax Receipt</span>
            <span className="font-mono text-xl font-bold">{order.order_number}</span>
            <span className="block text-stone-500 text-[11px] mt-0.5">
              Date: {new Date(order.created_at).toLocaleDateString("en-PK", { dateStyle: "long" })}
            </span>
          </div>
        </div>

        {/* FRAGILE COURIER WARNING BANNER */}
        <div className="my-5 p-3.5 bg-stone-100 border-2 border-stone-900 rounded-md flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-700 shrink-0" />
          <div>
            <strong className="text-sm font-bold block uppercase tracking-wide">
              ⚠️ HIGHLY FRAGILE GOODS — HANDLE WITH UTMOST CARE
            </strong>
            <p className="text-[11px] text-stone-700">
              Contains delicate porcelain, bone china & high-fired ceramics. Do NOT drop, stack heavy cargo on top, or crush.
            </p>
          </div>
        </div>

        {/* Deliver To & COD Banner */}
        <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-lg bg-stone-50 border border-stone-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Deliver To (Consignee):
            </span>
            <p className="text-sm font-bold text-stone-900">{order.shipping_address.recipient_name}</p>
            <p className="text-xs text-stone-700 mt-0.5">{order.shipping_address.street_address}</p>
            {order.shipping_address.landmark && (
              <p className="text-xs text-stone-500 italic">Near: {order.shipping_address.landmark}</p>
            )}
            <p className="text-xs font-semibold text-stone-900 mt-1">
              City: {order.shipping_address.city}, {order.shipping_address.province}
            </p>
            <p className="text-xs font-bold text-stone-900 mt-1">
              Phone: {order.shipping_address.phone}
            </p>
          </div>

          <div className="border-l border-stone-200 pl-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Courier Collection Amount (COD):
              </span>
              {isCOD ? (
                <div className="p-3 bg-amber-100 border border-amber-300 rounded text-center">
                  <span className="text-[10px] font-bold text-amber-900 block uppercase">Cash on Delivery Required</span>
                  <span className="font-serif text-2xl font-bold text-stone-900">
                    {formatPKR(order.total_pkr)}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded text-center">
                  <span className="text-[10px] font-bold text-emerald-900 block uppercase">Paid in Advance</span>
                  <span className="font-serif text-lg font-bold text-emerald-950">
                    DO NOT COLLECT CASH
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-600 mt-2">
              <span>Courier: <strong>{order.courier_code.toUpperCase()}</strong></span>
              {order.tracking_number && (
                <span className="ml-3 font-mono">Consignment #: {order.tracking_number}</span>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left border-collapse border border-stone-300 my-6">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-300 text-stone-700">
              <th className="p-2.5 font-semibold">SKU</th>
              <th className="p-2.5 font-semibold">Product Description</th>
              <th className="p-2.5 font-semibold text-center">Qty</th>
              <th className="p-2.5 font-semibold text-right">Price (PKR)</th>
              <th className="p-2.5 font-semibold text-right">Total (PKR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="p-2.5 font-mono text-stone-600">{i.sku}</td>
                <td className="p-2.5">
                  <strong className="text-stone-900 block">{i.product_title}</strong>
                  <span className="text-stone-500 text-[11px]">{i.variant_title}</span>
                </td>
                <td className="p-2.5 text-center font-bold">{i.quantity}</td>
                <td className="p-2.5 text-right">{formatPKR(i.price_pkr)}</td>
                <td className="p-2.5 text-right font-bold">{formatPKR(i.total_pkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-right">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal:</span>
              <span>{formatPKR(order.subtotal_pkr)}</span>
            </div>
            {order.discount_pkr > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatPKR(order.discount_pkr)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Shipping:</span>
              <span>{order.shipping_fee_pkr === 0 ? "FREE" : formatPKR(order.shipping_fee_pkr)}</span>
            </div>
            {order.cod_fee_pkr > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-500">COD Fee:</span>
                <span>{formatPKR(order.cod_fee_pkr)}</span>
              </div>
            )}
            {order.fragile_packaging_fee_pkr > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-500">Safety Packaging:</span>
                <span>{formatPKR(order.fragile_packaging_fee_pkr)}</span>
              </div>
            )}
            <div className="pt-2 border-t-2 border-stone-900 flex justify-between font-bold text-sm">
              <span>Grand Total:</span>
              <span className="font-serif">{formatPKR(order.total_pkr)}</span>
            </div>
          </div>
        </div>

        {/* Packing Signoff */}
        <div className="mt-10 pt-6 border-t border-dashed border-stone-300 grid grid-cols-3 gap-4 text-center text-[10px] text-stone-500">
          <div>
            <div className="h-10 border-b border-stone-400 mb-1" />
            <span>Packed & Bubble Wrapped By</span>
          </div>
          <div>
            <div className="h-10 border-b border-stone-400 mb-1" />
            <span>Fragile Seal Checked By</span>
          </div>
          <div>
            <div className="h-10 border-b border-stone-400 mb-1" />
            <span>Courier Dispatch Rider Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
