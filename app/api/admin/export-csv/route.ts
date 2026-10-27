import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

export async function GET() {
  const products = await getProducts();

  let csv = "Product Name,Slug,Material,Variant SKU,Variant Title,Price PKR,Compare Price PKR,Stock,Weight (g),Dishwasher Safe,Microwave Safe\n";

  products.forEach((p) => {
    p.variants.forEach((v) => {
      const row = [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.slug}"`,
        `"${p.material}"`,
        `"${v.sku}"`,
        `"${v.title.replace(/"/g, '""')}"`,
        v.price,
        v.compare_at_price || "",
        v.stock,
        v.weight_grams,
        p.care_instructions.dishwasher_safe ? "Yes" : "No",
        p.care_instructions.microwave_safe ? "Yes" : "No",
      ];
      csv += row.join(",") + "\n";
    });
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="crockery-inventory.csv"',
    },
  });
}
