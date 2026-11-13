import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const categorySlug = searchParams.get("category") || undefined;

  const products = await getProducts({ categorySlug });

  if (!q) {
    return NextResponse.json({
      products: products.slice(0, 6),
    });
  }

  const matched = products.filter((p) => {
    const inName = p.name.toLowerCase().includes(q);
    const inMaterial = p.material.toLowerCase().includes(q);
    const inDesc = p.description.toLowerCase().includes(q);
    const inSku = p.variants.some(
      (v) =>
        v.sku.toLowerCase().includes(q) || v.title.toLowerCase().includes(q)
    );
    return inName || inMaterial || inDesc || inSku;
  });

  return NextResponse.json({
    products: matched.slice(0, 8),
  });
}

