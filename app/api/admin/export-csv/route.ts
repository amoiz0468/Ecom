import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin credentials required" },
      { status: 401 }
    );
  }

  const products = await getProducts({ includeUnpublished: true });

  let csv =
    "Product Name,Slug,Material,Variant SKU,Variant Title,Price PKR,Compare Price PKR,Stock,Weight (g),Dishwasher Safe,Microwave Safe\n";

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
