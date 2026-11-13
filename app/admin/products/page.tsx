import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/data/catalog";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts({ includeUnpublished: true }),
    getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-stone-500">
          Loading catalog manager...
        </div>
      }
    >
      <AdminProductsClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
