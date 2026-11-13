import {
  Product,
  Category,
  ShippingZone,
  DiscountCode,
  StoreSettings,
} from "@/types";
import {
  CatalogRepository,
  DiscountRepository,
  SettingsRepository,
} from "@/lib/db/repositories";

export function getProductsMemoryStore(): Product[] {
  return CatalogRepository.getAllProducts({ includeUnpublished: true });
}

export function getCategoriesMemoryStore(): Category[] {
  return CatalogRepository.getAllCategories();
}

export function getShippingZonesMemoryStore(): ShippingZone[] {
  return SettingsRepository.getShippingZones();
}

export function getDiscountsMemoryStore(): DiscountCode[] {
  return DiscountRepository.getAll();
}

export function getStoreSettingsMemoryStore(): StoreSettings {
  return SettingsRepository.getStoreSettings();
}

export function commitCatalogChanges(): void {
  // SQLite commits immediately and replicates to Supabase via SupabaseSync
}

/**
 * Fetch all categories ordered by display_order
 */
export async function getCategories(): Promise<Category[]> {
  return CatalogRepository.getAllCategories();
}

/**
 * Fetch products with SQL filtering, search, material filter, price bounds, and sorting
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
