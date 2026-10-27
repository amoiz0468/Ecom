import { createClient } from "@/lib/supabase/client";
import { Product, Category } from "@/types";
import { PRODUCTS, CATEGORIES } from "./mock-catalog";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("your-project") &&
    !url.includes("placeholder") &&
    !key.includes("...") &&
    !key.includes("placeholder")
  );
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return CATEGORIES;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  } catch {
    // Fall back to seed mock data
  }
  return CATEGORIES;
}

/**
 * Fetch products with optional filtering and search
 */
export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  sort?: "price-asc" | "price-desc" | "newest" | "rating";
}): Promise<Product[]> {
  let list = [...PRODUCTS];

  if (options?.categorySlug) {
    const cat = CATEGORIES.find((c) => c.slug === options.categorySlug);
    if (cat) {
      list = list.filter((p) => p.category_id === cat.id);
    }
  }

  if (options?.featuredOnly) {
    list = list.filter((p) => p.is_featured);
  }

  if (options?.material) {
    list = list.filter(
      (p) => p.material.toLowerCase() === options.material?.toLowerCase()
    );
  }

  if (options?.query) {
    const q = options.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
    );
  }

  if (options?.minPrice !== undefined) {
    list = list.filter((p) =>
      p.variants.some((v) => v.price >= (options.minPrice ?? 0))
    );
  }

  if (options?.maxPrice !== undefined) {
    list = list.filter((p) =>
      p.variants.some((v) => v.price <= (options.maxPrice ?? 999999))
    );
  }

  if (options?.sort) {
    if (options.sort === "price-asc") {
      list.sort(
        (a, b) =>
          Math.min(...a.variants.map((v) => v.price)) -
          Math.min(...b.variants.map((v) => v.price))
      );
    } else if (options.sort === "price-desc") {
      list.sort(
        (a, b) =>
          Math.max(...b.variants.map((v) => v.price)) -
          Math.max(...a.variants.map((v) => v.price))
      );
    } else if (options.sort === "rating") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
  }

  return list;
}

/**
 * Fetch product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = PRODUCTS.find((p) => p.slug === slug);
  return product || null;
}
