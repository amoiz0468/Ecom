import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/lib/data/catalog";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/storefront/ProductCard";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Khaak & Khazaf" };
  }

  const price = product.variants[0]?.price || 0;

  return {
    title: product.seo_title || `${product.name} | Luxury Crockery Pakistan`,
    description:
      product.seo_description ||
      `Buy ${product.name} crafted in ${product.material}. Delivered safely across Pakistan with Cash on Delivery and 100% Breakage Guarantee.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0]?.image_url || "",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  // JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.image_url),
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Khaak & Khazaf",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.variants[0]?.price,
      availability:
        product.variants[0]?.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:underline">Crockery</Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Client Product Interactive Section */}
        <ProductDetailClient product={product} relatedProducts={related} />

        {/* Related Tableware */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800">
            <h2 className="font-serif text-2xl font-bold mb-6">You May Also Admire</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
