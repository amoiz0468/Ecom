import { getCategories } from "@/lib/data/catalog";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Categories &amp; Storefront Departments
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Organize your ceramic collections, homepage department tiles, and navigation links.
        </p>
      </div>

      <AdminCategoriesClient initialCategories={categories} />
    </div>
  );
}

