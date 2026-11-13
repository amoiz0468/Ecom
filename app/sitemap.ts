import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/data/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://almoincrockery.pk";
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const staticPages = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/breakage-policy",
    "/shipping-policy",
    "/care-guide",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productPages = products.map((p) => {
    const timestamps = p as { updated_at?: string; created_at?: string };
    return {
      url: `${baseUrl}/product/${p.slug}`,
      ...(timestamps.updated_at || timestamps.created_at
        ? {
            lastModified: new Date(
              timestamps.updated_at || timestamps.created_at || Date.now()
            ),
          }
        : {}),
      changeFrequency: "daily" as const,
      priority: 0.9,
    };
  });

  const categoryPages = categories.map((c) => ({
    url: `${baseUrl}/shop?category=${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
