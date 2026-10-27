import { getProducts } from "@/lib/data/catalog";
import { formatPKR } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Package, Download, AlertCircle, Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold">Crockery Catalog & Stock Matrix</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage bone china, porcelain, and stoneware dinner sets, variants, and warehouse stocks.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/api/admin/export-csv"
            download="crockery-inventory.csv"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold hover:bg-stone-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-stone-200 dark:divide-stone-800">
            <thead className="bg-stone-50 dark:bg-stone-800/60 font-semibold text-stone-600 dark:text-stone-300">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Price Range (PKR)</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Care Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {products.map((p) => {
                const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                const minPrice = Math.min(...p.variants.map((v) => v.price));
                const maxPrice = Math.max(...p.variants.map((v) => v.price));

                return (
                  <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={p.images[0]?.image_url || "/placeholder.jpg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <Link href={`/product/${p.slug}`} target="_blank" className="font-semibold text-stone-900 dark:text-stone-100 hover:underline">
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-stone-400 block">{p.slug}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-[11px]">
                        {p.material}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-stone-700 dark:text-stone-300 font-medium">
                        {p.variants.length} SKU(s)
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        {p.variants.map((v) => v.sku).join(", ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-serif font-bold">
                      {minPrice === maxPrice
                        ? formatPKR(minPrice)
                        : `${formatPKR(minPrice)} - ${formatPKR(maxPrice)}`}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          totalStock > 30
                            ? "bg-emerald-100 text-emerald-800"
                            : totalStock > 10
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {totalStock} in stock
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[10px] text-stone-500">
                      <span>Dishwasher: {p.care_instructions.dishwasher_safe ? "✓" : "✗"}</span> •{" "}
                      <span>Microwave: {p.care_instructions.microwave_safe ? "✓" : "✗"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
