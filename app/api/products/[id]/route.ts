import { NextRequest, NextResponse } from "next/server";
import { CatalogRepository } from "@/lib/db/repositories";
import { getAdminSession } from "@/lib/auth/admin";
import {
  deleteProductAction,
  toggleProductFlagAction,
  updateVariantStockPriceAction,
} from "@/lib/admin/actions";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getAdminSession();
  const isAdmin = session?.role === "admin";

  const product =
    CatalogRepository.getProductById(id) ||
    CatalogRepository.getProductBySlug(id, isAdmin);

  if (!product || (!isAdmin && !product.is_published)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.variantId && body.stock !== undefined && body.price !== undefined) {
      const res = await updateVariantStockPriceAction(
        id,
        body.variantId,
        Number(body.stock),
        Number(body.price)
      );
      if (!res.success) {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      }
      return NextResponse.json({ product: res.product });
    }

    if (body.toggleFlag === "is_published" || body.toggleFlag === "is_featured") {
      const res = await toggleProductFlagAction(id, body.toggleFlag);
      if (!res.success) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product: res.product });
    }

    return NextResponse.json({ error: "Unsupported PATCH payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized or invalid request" },
      { status: err.message?.includes("Unauthorized") ? 401 : 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await deleteProductAction(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

