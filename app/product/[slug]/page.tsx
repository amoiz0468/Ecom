import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/data/catalog";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/storefront/ProductCard";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | Almoin Crockery" };
  }

  return {
    title: product.seo_title || `${product.name} | Almoin Crockery`,
    description:
      product.seo_description ||
      `${product.name} crafted in ${product.material}. Delivered safely across Pakistan.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0]?.image_url || "/logo-card.jpg",
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
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const activeVariants = product.variants.filter((v) => v.is_active !== false);
  const prices = activeVariants.map((v) => v.price).filter((p) => p > 0);
  const hasStock = activeVariants.some((v) => v.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.image_url),
    description: product.description,
    brand: { "@type": "Brand", name: "Almoin Crockery" },
    offers:
      activeVariants.length > 1 && prices.length > 0
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "PKR",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: activeVariants.length,
            availability: hasStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          }
        : {
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
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="text-xs text-stone-400 mb-6 sm:mb-8 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-stone-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-stone-900 transition">
            Shop
          </Link>
          <span>/</span>
          <span className="text-stone-700 truncate max-w-[180px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        <ProductDetailClient product={product} />

        {related.length > 0 && (
          <section className="mt-14 sm:mt-20 pt-10 sm:pt-12 border-t border-stone-200/70">
            <h2 className="font-serif text-2xl font-medium text-stone-900 mb-6">
              Related Pieces
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
