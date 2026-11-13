"use server";

import { revalidatePath } from "next/cache";
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
  AnalyticsRepository,
} from "@/lib/db/repositories";
import { requireAdminAuth } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SaveProductInputSchema,
  SaveCategoryInputSchema,
  SaveDiscountInputSchema,
} from "@/lib/validators";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !url.includes("placeholder") &&
      !key.includes("...") &&
      !key.includes("placeholder")
  );
}

// ==========================================
// 1. PRODUCT & VARIANT MANAGEMENT
// ==========================================

export interface CreateOrUpdateProductInput {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  category_id: string;
  material: string;
  image_url: string;
  image_urls?: string[];
  dishwasher_safe: boolean;
  microwave_safe: boolean;
  oven_safe: boolean;
  handwash_only: boolean;
  is_featured: boolean;
  is_published: boolean;
  variants: {
    id?: string;
    sku: string;
    title: string;
    price: number;
    compare_at_price?: number;
    stock: number;
    piece_count: number;
    weight_grams: number;
  }[];
}

export async function saveProductAction(
  input: CreateOrUpdateProductInput
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const session = await requireAdminAuth();

    const parsed = SaveProductInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid product input.",
      };
    }

    const validInput = parsed.data;
    const cleanSlug =
      validInput.slug?.trim() ||
      validInput.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const productId = validInput.id || `prod-${Date.now()}`;

    const rawUrls = (
      validInput.image_urls && validInput.image_urls.length > 0
        ? validInput.image_urls
        : [validInput.image_url]
    )
      .map((u) => u.trim())
      .filter(Boolean);

    const finalUrls =
      rawUrls.length > 0
        ? rawUrls
        : ["/logo-card.jpg"];

    const newProduct: Product = {
      id: productId,
      name: validInput.name.trim(),
      slug: cleanSlug,
      description:
        validInput.description.trim() || "Handcrafted luxury tableware.",
      category_id: validInput.category_id,
      material: validInput.material || "Bone China",
      care_instructions: {
        dishwasher_safe: validInput.dishwasher_safe,
        microwave_safe: validInput.microwave_safe,
        oven_safe: validInput.oven_safe,
        handwash_only: validInput.handwash_only,
      },
      is_fragile: true,
      breakage_guarantee:
        "Protected by 100% Free Transit Breakage Replacement Guarantee (30-second unboxing video required)",
      is_featured: validInput.is_featured,
      is_published: validInput.is_published,
      rating: 0,
      review_count: 0,
      images: finalUrls.map((url, idx) => ({
        id: `img-${productId}-${idx + 1}`,
        product_id: productId,
        image_url: url,
        alt_text: validInput.name.trim(),
        is_primary: idx === 0,
        display_order: idx + 1,
      })),
      variants: validInput.variants.map((v, idx) => ({
        id: v.id || `var-${productId}-${idx + 1}`,
        product_id: productId,
        sku: v.sku.trim().toUpperCase() || `KK-SKU-${Date.now()}-${idx + 1}`,
        title: v.title.trim() || "Standard Set",
        price: Math.max(0, Math.round(Number(v.price) || 0)),
        compare_at_price: v.compare_at_price
          ? Math.max(0, Math.round(Number(v.compare_at_price)))
          : undefined,
        stock: Math.max(0, Math.round(Number(v.stock) || 0)),
        piece_count: Math.max(1, Math.round(Number(v.piece_count) || 1)),
        weight_grams: Math.max(100, Math.round(Number(v.weight_grams) || 500)),
        dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
        attributes: {},
        is_active: true,
      })),
    };

    CatalogRepository.upsertProduct(newProduct, session.username);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from("products").upsert({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          category_id: newProduct.category_id,
          material: newProduct.material,
          care_instructions: newProduct.care_instructions,
          is_featured: newProduct.is_featured,
          is_published: newProduct.is_published,
        });
      } catch {
        // Fallback to SQLite
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${newProduct.slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return { success: true, product: newProduct };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save product." };
  }
}

export async function updateVariantStockPriceAction(
  productId: string,
  variantId: string,
  newStock: number,
  newPrice: number
): Promise<{ success: boolean; product?: Product }> {
  const session = await requireAdminAuth();
  const updated = CatalogRepository.updateVariantStockAndPrice(
    productId,
    variantId,
    newStock,
    newPrice,
    session.username
  );
  if (!updated) return { success: false };

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${updated.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return { success: true, product: updated };
}

export async function toggleProductFlagAction(
  productId: string,
  field: "is_published" | "is_featured"
): Promise<{ success: boolean; product?: Product }> {
  const session = await requireAdminAuth();
  const updated = CatalogRepository.toggleProductFlag(
    productId,
    field,
    session.username
  );
  if (!updated) return { success: false };

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");

  return { success: true, product: updated };
}

export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean }> {
  const session = await requireAdminAuth();
  CatalogRepository.deleteProduct(productId, session.username);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return { success: true };
}

// ==========================================
// 2. CATEGORIES MANAGEMENT
// ==========================================

export async function saveCategoryAction(input: {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  display_order?: number;
}): Promise<{ success: boolean; categories: Category[]; error?: string }> {
  const session = await requireAdminAuth();
  const parsed = SaveCategoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      categories: CatalogRepository.getAllCategories(),
      error: parsed.error.issues[0]?.message || "Category name is required.",
    };
  }

  const valid = parsed.data;
  const existingCategories = CatalogRepository.getAllCategories();
  const cleanSlug =
    valid.slug?.trim() ||
    valid.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const categoryId = valid.id || `cat-${Date.now()}`;
  const newCategory: Category = {
    id: categoryId,
    name: valid.name.trim(),
    slug: cleanSlug,
    description: valid.description?.trim() || "",
    image_url:
      valid.image_url?.trim() ||
      "/logo-card.jpg",
    display_order: Number(valid.display_order) || existingCategories.length + 1,
  };

  CatalogRepository.upsertCategory(newCategory, session.username);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
    categories: CatalogRepository.getAllCategories(),
  };
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: boolean; categories: Category[] }> {
  const session = await requireAdminAuth();
  CatalogRepository.deleteCategory(categoryId, session.username);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");

  return {
    success: true,
    categories: CatalogRepository.getAllCategories(),
  };
}

// ==========================================
// 3. DISCOUNT COUPONS MANAGEMENT
// ==========================================

export async function getAdminDiscountsAction(): Promise<DiscountCode[]> {
  return DiscountRepository.getAll();
}

export async function saveDiscountAction(input: {
  id?: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount_pkr: number;
  usage_limit?: number;
}): Promise<{ success: boolean; discounts: DiscountCode[]; error?: string }> {
  const session = await requireAdminAuth();
  const parsed = SaveDiscountInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      discounts: DiscountRepository.getAll(),
      error: parsed.error.issues[0]?.message || "Invalid coupon parameters.",
    };
  }

  const valid = parsed.data;
  const cleanCode = valid.code.trim().toUpperCase().replace(/\s+/g, "");
  const existing = DiscountRepository.findByCode(cleanCode);

  const newDiscount: DiscountCode = {
    id: valid.id || existing?.id || `disc-${Date.now()}`,
    code: cleanCode,
    description: valid.description.trim() || "Special store promotion",
    discount_type: valid.discount_type,
    discount_value: Math.max(1, Math.round(Number(valid.discount_value) || 10)),
    min_order_amount_pkr: Math.max(
      0,
      Math.round(Number(valid.min_order_amount_pkr) || 0)
    ),
    usage_limit: valid.usage_limit
      ? Math.round(Number(valid.usage_limit))
      : undefined,
    times_used: existing?.times_used || 0,
    is_active: true,
  };

  DiscountRepository.upsert(newDiscount, session.username);

  revalidatePath("/admin/discounts");
  return { success: true, discounts: DiscountRepository.getAll() };
}

export async function toggleDiscountStatusAction(
  discountId: string
): Promise<{ success: boolean; discounts: DiscountCode[] }> {
  const session = await requireAdminAuth();
  DiscountRepository.toggleStatus(discountId, session.username);
  revalidatePath("/admin/discounts");
  return { success: true, discounts: DiscountRepository.getAll() };
}

export async function deleteDiscountAction(
  discountId: string
): Promise<{ success: boolean; discounts: DiscountCode[] }> {
  const session = await requireAdminAuth();
  DiscountRepository.delete(discountId, session.username);
  revalidatePath("/admin/discounts");
  return { success: true, discounts: DiscountRepository.getAll() };
}

// ==========================================
// 4. SHIPPING ZONES, STORE SETTINGS & ANALYTICS
// ==========================================

export async function getAdminShippingAndSettingsAction(): Promise<{
  zones: ShippingZone[];
  settings: StoreSettings;
}> {
  return {
    zones: SettingsRepository.getShippingZones(),
    settings: SettingsRepository.getStoreSettings(),
  };
}

export async function updateShippingZoneAction(
  zoneId: string,
  updates: Partial<ShippingZone>
): Promise<{ success: boolean; zones: ShippingZone[] }> {
  const session = await requireAdminAuth();
  const zones = SettingsRepository.updateShippingZone(
    zoneId,
    updates,
    session.username
  );

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true, zones };
}

export async function updateStoreSettingsAction(
  updates: Partial<StoreSettings>
): Promise<{ success: boolean; settings: StoreSettings }> {
  const session = await requireAdminAuth();
  const settings = SettingsRepository.updateStoreSettings(
    updates,
    session.username
  );
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
  return { success: true, settings };
}

export async function getAdminAnalyticsAction() {
  await requireAdminAuth();
  return AnalyticsRepository.getDashboardMetrics();
}
