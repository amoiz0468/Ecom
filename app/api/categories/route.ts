import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/data/catalog";
import { saveCategoryAction, deleteCategoryAction } from "@/lib/admin/actions";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await saveCategoryAction(body);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json({ categories: res.categories }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save category" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Category id is required" },
        { status: 400 }
      );
    }
    const res = await deleteCategoryAction(id);
    return NextResponse.json({ categories: res.categories });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete category" },
      { status: err.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

