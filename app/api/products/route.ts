import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/data/catalog";
import { saveProductAction } from "@/lib/admin/actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") || undefined;
  const material = searchParams.get("material") || undefined;
  const query = searchParams.get("q") || undefined;
  const sort = (searchParams.get("sort") as any) || undefined;

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug, material, query, sort }),
    getCategories(),
  ]);

  return NextResponse.json({ products, categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await saveProductAction(body);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ product: res.product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save product" },
      { status: 500 }
    );
  }
}

