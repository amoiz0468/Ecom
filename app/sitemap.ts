import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/data/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://khaak-khazaf.pk";
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const staticPages = [
    "",
    "/shop",
    "/cart",
    "/checkout",
    "/track",
    "/about",
    "/contact",
    "/faq",
    "/breakage-policy",
    "/shipping-policy",
    "/care-guide",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productPages = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${baseUrl}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
