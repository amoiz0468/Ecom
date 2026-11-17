import { Product, Category } from "@/types";
import { CatalogRepository } from "@/lib/db/repositories";

/**
 * Fetch all categories ordered by display_order
 */
export async function getCategories(): Promise<Category[]> {
  return CatalogRepository.getAllCategories();
}

/**
 * Fetch products with filtering, search, material filter, price bounds, and sorting
 */
export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  sort?: "price-asc" | "price-desc" | "newest" | "rating";
}): Promise<Product[]> {
  return CatalogRepository.getAllProducts(options);
}

/**
 * Fetch product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return CatalogRepository.getProductBySlug(slug, false);
}
