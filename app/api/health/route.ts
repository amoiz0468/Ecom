import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const start = performance.now();
  try {
    const supabase = createAdminClient();
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

    const firstError =
      productsRes.error || categoriesRes.error || ordersRes.error;
    if (firstError) {
      throw new Error(firstError.message);
    }

    const latencyMs = Number((performance.now() - start).toFixed(2));

    return NextResponse.json({
      status: "healthy",
      engine: "supabase-postgres",
      tables: {
        products: productsRes.count ?? 0,
        categories: categoriesRes.count ?? 0,
        orders: ordersRes.count ?? 0,
      },
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        error:
          (err instanceof Error && err.message) ||
          "Database health check failed",
      },
      { status: 500 }
    );
  }
}
