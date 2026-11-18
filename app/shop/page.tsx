import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/data/catalog";
import { ShopCatalogClient } from "@/components/storefront/ShopCatalogClient";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const revalidate = 60;

export const metadata = {
  title: "Shop All | Crockery, Ladies Boutique & Footwear",
  description:
    "Browse fine crockery dinner sets, ladies ready-to-wear boutique suits, and ladies shoes with Cash on Delivery across Pakistan.",
  alternates: {
    canonical: "/shop",
  },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900 bg-kiln-mesh">
      <Navbar />
      <CartDrawer />

      <Suspense
        fallback={
          <div className="flex-1 py-20 text-center text-xs text-stone-500">
            Loading tableware catalog...
          </div>
        }
      >
        <ShopCatalogClient initialProducts={products} categories={categories} />
      </Suspense>

      <Footer />
    </div>
  );
}
