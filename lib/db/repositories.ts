import {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentProviderId,
  CourierCode,
  ShippingZone,
  DiscountCode,
  StoreSettings,
  CustomerInquiry,
} from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { appendAuditLog, AuditLogEntry } from "@/lib/db/audit";
import { getDefaultStoreSettings } from "@/lib/db/defaults";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SHIPPING_ZONES,
} from "@/lib/data/constants";

/**
 * Data access layer backed by Supabase Postgres (single source of truth).
 * Every method is async. Multi-table writes that must be atomic (orders,
 * stock, product saves) run as Postgres functions defined in
 * supabase/migrations/005_production_readiness.sql.
 */

type Row = Record<string, unknown>;

const PRODUCT_SELECT =
  "*, variants:product_variants(*), images:product_images(*)";
const ORDER_SELECT = "*, items:order_items(*)";

const DEFAULT_ORDER_PAGE_SIZE = 500;
const MAX_ORDER_PAGE_SIZE = 1000;
const MAX_PRODUCTS = 1000;

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));
const num = (v: unknown, fallback = 0): number =>
  v === null || v === undefined ? fallback : Number(v);

interface DbError {
  message: string;
  code?: string;
}

function check<T>(
  res: { data: T | null; error: DbError | null },
  context: string
): T {
  if (res.error) {
    throw new Error(`${context}: ${res.error.message}`);
  }
  return res.data as T;
}

/** Escape LIKE wildcards so user input is matched literally by ilike. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ============================================================================
// 1. CATALOG REPOSITORY (Categories, Products, Variants, Images)
// ============================================================================

export const CatalogRepository = {
  async getAllCategories(): Promise<Category[]> {
    const supabase = createAdminClient();
    const rows = check(
      await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      "Load categories"
    ) as Row[];
    return rows.map(mapCategoryRow);
  },

  async upsertCategory(category: Category, actor = "admin"): Promise<Category> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("categories").upsert({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      display_order: category.display_order,
    });
    if (error) {
      if (error.code === "23505") {
        throw new Error("A category with this slug already exists.");
      }
      throw new Error(`Save category: ${error.message}`);
    }

    await appendAuditLog({
      actor,
      action: "UPSERT_CATEGORY",
      entity_type: "category",
      entity_id: category.id,
      details: `Saved category "${category.name}" (${category.slug})`,
    });
    return category;
  },

  async deleteCategory(categoryId: string, actor = "admin"): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);
    if (error) {
      if (error.code === "23503") {
        throw new Error(
          "This category still has products. Move or delete them first."
        );
      }
      throw new Error(`Delete category: ${error.message}`);
    }
    await appendAuditLog({
      actor,
      action: "DELETE_CATEGORY",
      entity_type: "category",
      entity_id: categoryId,
      details: `Deleted category ${categoryId}`,
    });
  },

  async getAllProducts(options?: {
    categorySlug?: string;
    query?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    featuredOnly?: boolean;
    includeUnpublished?: boolean;
    sort?: "price-asc" | "price-desc" | "newest" | "rating";
  }): Promise<Product[]> {
    const supabase = createAdminClient();

    let categoryId: string | undefined;
    if (options?.categorySlug) {
      const { data, error } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", options.categorySlug)
        .maybeSingle();
      if (error) throw new Error(`Load category: ${error.message}`);
      if (!data) return [];
      categoryId = String(data.id);
    }

    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })
      .limit(MAX_PRODUCTS);

    if (!options?.includeUnpublished) query = query.eq("is_published", true);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (options?.featuredOnly) query = query.eq("is_featured", true);
    if (options?.material) {
      query = query.ilike("material", escapeLike(options.material));
    }

    const rows = check(await query, "Load products") as Row[];
    let products = rows.map(mapEmbeddedProductRow);

    if (options?.query) {
      const q = options.query.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.variants.some(
            (v) =>
              v.sku.toLowerCase().includes(q) || v.title.toLowerCase().includes(q)
          )
      );
    }

    if (options?.minPrice !== undefined) {
      products = products.filter((p) =>
        p.variants.some((v) => v.price >= (options.minPrice ?? 0))
      );
    }

    if (options?.maxPrice !== undefined) {
      products = products.filter((p) =>
        p.variants.some((v) => v.price <= (options.maxPrice ?? 9999999))
      );
    }

    if (options?.sort) {
      if (options.sort === "price-asc") {
        products.sort(
          (a, b) =>
            Math.min(...a.variants.map((v) => v.price)) -
            Math.min(...b.variants.map((v) => v.price))
        );
      } else if (options.sort === "price-desc") {
        products.sort(
          (a, b) =>
            Math.max(...b.variants.map((v) => v.price)) -
            Math.max(...a.variants.map((v) => v.price))
        );
      } else if (options.sort === "rating") {
        products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      }
    }

    return products;
  },

  async getProductBySlug(
    slug: string,
    includeUnpublished = false
  ): Promise<Product | null> {
    const supabase = createAdminClient();
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug);
    if (!includeUnpublished) query = query.eq("is_published", true);

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Load product: ${error.message}`);
    return data ? mapEmbeddedProductRow(data as Row) : null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Load product: ${error.message}`);
    return data ? mapEmbeddedProductRow(data as Row) : null;
  },

  /**
   * Loads only the active variants (with their published parent product)
   * that a checkout references, instead of the whole catalog.
   */
  async getCheckoutVariants(
    variantIds: string[]
  ): Promise<Map<string, { product: Product; variant: ProductVariant }>> {
    const result = new Map<string, { product: Product; variant: ProductVariant }>();
    const ids = Array.from(new Set(variantIds.filter(Boolean)));
    if (ids.length === 0) return result;

    const supabase = createAdminClient();
    const rows = check(
      await supabase
        .from("product_variants")
        .select("*, product:products!inner(*, images:product_images(*))")
        .in("id", ids)
        .eq("is_active", true)
        .eq("product.is_published", true),
      "Load checkout variants"
    ) as Row[];

    for (const row of rows) {
      const variant = mapVariantRow(row);
      const product = mapEmbeddedProductRow({
        ...(row.product as Row),
        variants: [row],
      });
      result.set(variant.id, { product, variant });
    }
    return result;
  },

  async upsertProduct(product: Product, actor = "admin"): Promise<Product> {
    const supabase = createAdminClient();

    const { error } = await supabase.rpc("upsert_product_tx", {
      p_product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        material: product.material,
        care_instructions: product.care_instructions,
        is_fragile: product.is_fragile,
        breakage_guarantee: product.breakage_guarantee,
        is_featured: product.is_featured,
        is_published: product.is_published !== false,
        seo_title: product.seo_title ?? null,
        seo_description: product.seo_description ?? null,
        rating: product.rating ?? 0,
        review_count: product.review_count ?? 0,
      },
      p_variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price ?? null,
        stock: v.stock,
        weight_grams: v.weight_grams || 500,
        dimensions: v.dimensions || { length_cm: 30, width_cm: 30, height_cm: 12 },
        piece_count: v.piece_count || 1,
        attributes: v.attributes || {},
        is_active: v.is_active !== false,
      })),
      p_images: product.images.map((img) => ({
        id: img.id,
        variant_id: img.variant_id ?? null,
        image_url: img.image_url,
        alt_text: img.alt_text || product.name,
        is_primary: Boolean(img.is_primary),
        display_order: img.display_order || 1,
      })),
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error(
          "That slug or SKU is already used by another product. Please change it."
        );
      }
      // Fallback to sequential upserts if 005_production_readiness.sql hasn't been run yet
      if (error.message.includes("schema cache") || error.code === "PGRST202") {
        const { error: prodErr } = await supabase.from("products").upsert({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          category_id: product.category_id,
          material: product.material,
          care_instructions: product.care_instructions,
          is_fragile: product.is_fragile,
          breakage_guarantee: product.breakage_guarantee,
          is_featured: product.is_featured,
          is_published: product.is_published !== false,
          seo_title: product.seo_title ?? null,
          seo_description: product.seo_description ?? null,
          rating: product.rating ?? 0,
          review_count: product.review_count ?? 0,
          updated_at: new Date().toISOString(),
        });
        if (prodErr) throw new Error(`Save product: ${prodErr.message}`);

        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", product.id);
        if (product.variants.length > 0) {
          const { error: varErr } = await supabase
            .from("product_variants")
            .insert(
              product.variants.map((v) => ({
                id: v.id,
                product_id: product.id,
                sku: v.sku,
                title: v.title,
                price: v.price,
                compare_at_price: v.compare_at_price ?? null,
                stock: v.stock,
                weight_grams: v.weight_grams || 500,
                dimensions: v.dimensions || {
                  length_cm: 30,
                  width_cm: 30,
                  height_cm: 12,
                },
                piece_count: v.piece_count || 1,
                attributes: v.attributes || {},
                is_active: v.is_active !== false,
              }))
            );
          if (varErr) throw new Error(`Save variants: ${varErr.message}`);
        }

        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", product.id);
        if (product.images.length > 0) {
          const { error: imgErr } = await supabase
            .from("product_images")
            .insert(
              product.images.map((img) => ({
                id: img.id,
                product_id: product.id,
                variant_id: img.variant_id ?? null,
                image_url: img.image_url,
                alt_text: img.alt_text || product.name,
                is_primary: Boolean(img.is_primary),
                display_order: img.display_order || 1,
              }))
            );
          if (imgErr) throw new Error(`Save images: ${imgErr.message}`);
        }
      } else {
        throw new Error(`Save product: ${error.message}`);
      }
    }

    await appendAuditLog({
      actor,
      action: "UPSERT_PRODUCT",
      entity_type: "product",
      entity_id: product.id,
      details: `Saved product "${product.name}" with ${product.variants.length} variant(s)`,
    });
    return product;
  },

  async updateVariantStockAndPrice(
    productId: string,
    variantId: string,
    newStock: number,
    newPrice: number,
    actor = "admin"
  ): Promise<Product | null> {
    const supabase = createAdminClient();
    const cleanStock = Math.max(0, Math.round(newStock));
    const cleanPrice = Math.max(0, Math.round(newPrice));

    const { data, error } = await supabase
      .from("product_variants")
      .update({
        stock: cleanStock,
        price: cleanPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variantId)
      .eq("product_id", productId)
      .select("id");
    if (error) throw new Error(`Update variant: ${error.message}`);
    if (!data || data.length === 0) return null;

    await supabase
      .from("products")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", productId);

    await appendAuditLog({
      actor,
      action: "UPDATE_VARIANT_INVENTORY",
      entity_type: "product_variant",
      entity_id: variantId,
      details: `Updated variant ${variantId} -> stock: ${cleanStock}, price: Rs. ${cleanPrice}`,
    });

    return this.getProductById(productId);
  },

  async toggleProductFlag(
    productId: string,
    field: "is_published" | "is_featured",
    actor = "admin"
  ): Promise<Product | null> {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("products")
      .select(field)
      .eq("id", productId)
      .maybeSingle();
    if (error) throw new Error(`Load product: ${error.message}`);
    if (!row) return null;

    const nextVal = !(row as unknown as Row)[field];
    const { error: updateError } = await supabase
      .from("products")
      .update({ [field]: nextVal, updated_at: new Date().toISOString() })
      .eq("id", productId);
    if (updateError) throw new Error(`Update product: ${updateError.message}`);

    await appendAuditLog({
      actor,
      action: "TOGGLE_PRODUCT_FLAG",
      entity_type: "product",
      entity_id: productId,
      details: `Toggled ${field} to ${nextVal}`,
    });

    return this.getProductById(productId);
  },

  async deleteProduct(productId: string, actor = "admin"): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) throw new Error(`Delete product: ${error.message}`);

    await appendAuditLog({
      actor,
      action: "DELETE_PRODUCT",
      entity_type: "product",
      entity_id: productId,
      details: `Deleted product ${productId}`,
    });
  },
};

// ============================================================================
// 2. ORDER REPOSITORY (Atomic Checkout & Fulfillment)
// ============================================================================

export const OrderRepository = {
  /**
   * Atomically verifies + deducts stock, increments coupon usage and inserts
   * the order and its items (Postgres function create_order_tx).
   * Throws an Error whose `code` is "23505" on a duplicate order number so the
   * caller can retry with a fresh number.
   */
  async createOrderTransaction(
    order: Order,
    appliedCouponCode?: string
  ): Promise<Order> {
    const supabase = createAdminClient();

    const { error } = await supabase.rpc("create_order_tx", {
      p_order: {
        id: order.id,
        order_number: order.order_number,
        customer_id: order.customer_id ?? null,
        guest_info: order.guest_info,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method || "cod",
        shipping_address: order.shipping_address,
        subtotal_pkr: order.subtotal_pkr,
        discount_pkr: order.discount_pkr,
        shipping_fee_pkr: order.shipping_fee_pkr,
        cod_fee_pkr: order.cod_fee_pkr,
        fragile_packaging_fee_pkr: order.fragile_packaging_fee_pkr,
        total_pkr: order.total_pkr,
        notes: order.notes ?? null,
        courier_code: order.courier_code || "tcs",
        tracking_number: order.tracking_number ?? null,
        tracking_url: order.tracking_url ?? null,
        payment_proof_url: order.payment_proof_url ?? null,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      p_items: order.items.map((i) => ({
        id: i.id,
        order_id: order.id,
        variant_id: i.variant_id,
        product_title: i.product_title,
        variant_title: i.variant_title,
        sku: i.sku,
        price_pkr: i.price_pkr,
        quantity: i.quantity,
        total_pkr: i.total_pkr,
        image_url: i.image_url ?? null,
      })),
      p_coupon: appliedCouponCode?.trim() || null,
    });

    if (error) {
      const err = new Error(error.message) as Error & { code?: string };
      err.code = error.code;
      throw err;
    }

    await appendAuditLog({
      actor: order.guest_info.email || order.guest_info.phone || "guest",
      action: "ORDER_PLACED",
      entity_type: "order",
      entity_id: order.order_number,
      details: `Placed order ${order.order_number} for Rs. ${order.total_pkr.toLocaleString()} (${order.payment_method?.toUpperCase()})`,
    });

    return order;
  },

  async getOrderByIdOrNumber(idOrNumber: string): Promise<Order | null> {
    const clean = idOrNumber.trim();
    if (!clean) return null;
    const supabase = createAdminClient();

    const byId = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", clean)
      .maybeSingle();
    if (byId.error) throw new Error(`Load order: ${byId.error.message}`);
    if (byId.data) return mapOrderRow(byId.data as Row);

    const byNumber = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("order_number", clean.toUpperCase())
      .maybeSingle();
    if (byNumber.error) {
      throw new Error(`Load order: ${byNumber.error.message}`);
    }
    return byNumber.data ? mapOrderRow(byNumber.data as Row) : null;
  },

  async getAllOrders(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const supabase = createAdminClient();
    const limit = Math.min(
      MAX_ORDER_PAGE_SIZE,
      Math.max(
        1,
        Math.floor(
          typeof options?.limit === "number" && options.limit > 0
            ? options.limit
            : DEFAULT_ORDER_PAGE_SIZE
        )
      )
    );
    const offset = Math.max(0, Math.floor(options?.offset || 0));

    const rows = check(
      await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
      "Load orders"
    ) as Row[];
    return rows.map(mapOrderRow);
  },

  async updateOrderStatusTransaction(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    trackingNumber?: string,
    courierCode?: CourierCode,
    actor = "admin"
  ): Promise<Order | null> {
    const existing = await this.getOrderByIdOrNumber(orderId);
    if (!existing) return null;

    const supabase = createAdminClient();
    const nextPaymentStatus = paymentStatus || existing.payment_status;
    const nextTracking =
      trackingNumber !== undefined ? trackingNumber : existing.tracking_number;
    const nextCourier = courierCode || existing.courier_code;

    const { data, error } = await supabase.rpc("update_order_status_tx", {
      p_order_id: existing.id,
      p_status: status,
      p_payment_status: nextPaymentStatus,
      p_tracking_number: nextTracking ?? null,
      p_courier_code: nextCourier,
    });
    if (error) throw new Error(`Update order: ${error.message}`);
    if (data === false) return null;

    await appendAuditLog({
      actor,
      action: "ORDER_STATUS_UPDATED",
      entity_type: "order",
      entity_id: existing.order_number,
      details: `Order ${existing.order_number}: ${existing.status} -> ${status} (payment: ${nextPaymentStatus})`,
    });

    return this.getOrderByIdOrNumber(existing.id);
  },

  async attachPaymentProof(
    orderIdOrNumber: string,
    proofUrl: string
  ): Promise<Order | null> {
    const existing = await this.getOrderByIdOrNumber(orderIdOrNumber);
    if (!existing) return null;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({
        payment_proof_url: proofUrl,
        payment_status: "awaiting_verification",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw new Error(`Attach payment proof: ${error.message}`);

    await appendAuditLog({
      actor: existing.guest_info.phone || "customer",
      action: "PAYMENT_PROOF_UPLOADED",
      entity_type: "order",
      entity_id: existing.order_number,
      details: `Customer uploaded transfer receipt for ${existing.order_number}: ${proofUrl}`,
    });

    return this.getOrderByIdOrNumber(existing.id);
  },

  async deleteOrder(orderId: string, actor = "admin"): Promise<void> {
    const existing = await this.getOrderByIdOrNumber(orderId);
    if (!existing) return;

    const supabase = createAdminClient();
    const { error } = await supabase.rpc("delete_order_tx", {
      p_order_id: existing.id,
    });
    if (error) throw new Error(`Delete order: ${error.message}`);

    await appendAuditLog({
      actor,
      action: "ORDER_DELETED",
      entity_type: "order",
      entity_id: existing.order_number,
      details: `Deleted order ${existing.order_number}`,
    });
  },
};

// ============================================================================
// 3. DISCOUNTS, SHIPPING ZONES & SETTINGS REPOSITORY
// ============================================================================

export const DiscountRepository = {
  async getAll(): Promise<DiscountCode[]> {
    const supabase = createAdminClient();
    const rows = check(
      await supabase
        .from("discounts")
        .select("*")
        .order("code", { ascending: true }),
      "Load discounts"
    ) as Row[];
    return rows.map(mapDiscountRow);
  },

  async findByCode(code: string): Promise<DiscountCode | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw new Error(`Load discount: ${error.message}`);
    return data ? mapDiscountRow(data as Row) : null;
  },

  async upsert(discount: DiscountCode, actor = "admin"): Promise<DiscountCode> {
    const supabase = createAdminClient();
    // times_used is intentionally not written, so editing a coupon never
    // resets how many times customers have used it.
    const { error } = await supabase.from("discounts").upsert({
      id: discount.id,
      code: discount.code.toUpperCase(),
      description: discount.description,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_order_amount_pkr: discount.min_order_amount_pkr,
      usage_limit: discount.usage_limit ?? null,
      is_active: discount.is_active,
    });
    if (error) {
      if (error.code === "23505") {
        throw new Error("A coupon with this code already exists.");
      }
      throw new Error(`Save discount: ${error.message}`);
    }

    await appendAuditLog({
      actor,
      action: "UPSERT_DISCOUNT",
      entity_type: "discount",
      entity_id: discount.code,
      details: `Saved promo code ${discount.code} (${discount.discount_value} ${discount.discount_type})`,
    });
    return discount;
  },

  async toggleStatus(discountId: string, actor = "admin"): Promise<void> {
    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("discounts")
      .select("is_active, code")
      .eq("id", discountId)
      .maybeSingle();
    if (error) throw new Error(`Load discount: ${error.message}`);
    if (!row) return;

    const next = !row.is_active;
    const { error: updateError } = await supabase
      .from("discounts")
      .update({ is_active: next })
      .eq("id", discountId);
    if (updateError) throw new Error(`Update discount: ${updateError.message}`);

    await appendAuditLog({
      actor,
      action: "TOGGLE_DISCOUNT",
      entity_type: "discount",
      entity_id: String(row.code),
      details: `Set coupon ${row.code} active = ${next}`,
    });
  },

  async delete(discountId: string, actor = "admin"): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("discounts")
      .delete()
      .eq("id", discountId);
    if (error) throw new Error(`Delete discount: ${error.message}`);

    await appendAuditLog({
      actor,
      action: "DELETE_DISCOUNT",
      entity_type: "discount",
      entity_id: discountId,
      details: `Deleted discount ${discountId}`,
    });
  },
};

export const SettingsRepository = {
  async getShippingZones(): Promise<ShippingZone[]> {
    const supabase = createAdminClient();
    const rows = check(
      await supabase.from("shipping_zones").select("*"),
      "Load shipping zones"
    ) as Row[];
    return rows.map(mapShippingZoneRow);
  },

  async updateShippingZone(
    zoneId: string,
    updates: Partial<ShippingZone>,
    actor = "admin"
  ): Promise<ShippingZone[]> {
    const existing = (await this.getShippingZones()).find(
      (z) => z.id === zoneId
    );
    if (existing) {
      const clean = (value: number | undefined, current: number) =>
        value !== undefined ? Math.max(0, Math.round(Number(value))) : current;

      const merged: ShippingZone = {
        ...existing,
        base_rate_pkr: clean(updates.base_rate_pkr, existing.base_rate_pkr),
        per_kg_extra_pkr: clean(
          updates.per_kg_extra_pkr,
          existing.per_kg_extra_pkr
        ),
        free_shipping_threshold_pkr: clean(
          updates.free_shipping_threshold_pkr,
          existing.free_shipping_threshold_pkr
        ),
        cod_fee_pkr: clean(updates.cod_fee_pkr, existing.cod_fee_pkr),
      };

      const supabase = createAdminClient();
      const { error } = await supabase
        .from("shipping_zones")
        .update({
          base_rate_pkr: merged.base_rate_pkr,
          per_kg_extra_pkr: merged.per_kg_extra_pkr,
          free_shipping_threshold_pkr: merged.free_shipping_threshold_pkr,
          cod_fee_pkr: merged.cod_fee_pkr,
        })
        .eq("id", zoneId);
      if (error) throw new Error(`Update shipping zone: ${error.message}`);

      await appendAuditLog({
        actor,
        action: "UPDATE_SHIPPING_ZONE",
        entity_type: "shipping_zone",
        entity_id: zoneId,
        details: `Updated rates for "${merged.zone_name}" (base: Rs. ${merged.base_rate_pkr})`,
      });
    }
    return this.getShippingZones();
  },

  async getStoreSettings(): Promise<StoreSettings> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("settings_json")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(`Load store settings: ${error.message}`);
    if (!data || typeof data.settings_json !== "object" || !data.settings_json) {
      return getDefaultStoreSettings();
    }
    return {
      ...getDefaultStoreSettings(),
      ...(data.settings_json as Partial<StoreSettings>),
    };
  },

  async updateStoreSettings(
    updates: Partial<StoreSettings>,
    actor = "admin"
  ): Promise<StoreSettings> {
    const merged = { ...(await this.getStoreSettings()), ...updates };
    const supabase = createAdminClient();
    const { error } = await supabase.from("store_settings").upsert({
      id: 1,
      settings_json: merged,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Save store settings: ${error.message}`);

    await appendAuditLog({
      actor,
      action: "UPDATE_STORE_SETTINGS",
      entity_type: "store_settings",
      entity_id: "global",
      details: `Updated store configuration (${merged.store_name})`,
    });
    return merged;
  },
};

// ============================================================================
// 4. ANALYTICS & AUDIT REPOSITORY
// ============================================================================

export interface DashboardMetrics {
  orderSummary: {
    total_orders: number;
    total_revenue_pkr: number;
    pending_orders: number;
    fulfilled_orders: number;
  };
  inventorySummary: {
    total_products: number;
    total_skus: number;
    total_units_in_stock: number;
    low_stock_skus: number;
  };
  paymentBreakdown: {
    payment_method: string;
    order_count: number;
    revenue_pkr: number;
  }[];
  topSellingSkus: {
    sku: string;
    product_title: string;
    variant_title: string;
    units_sold: number;
    revenue_pkr: number;
  }[];
  recentAuditLogs: AuditLogEntry[];
  customerInquiries: CustomerInquiry[];
}

export const AnalyticsRepository = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const supabase = createAdminClient();

    const [metricsRes, auditRes, inquiryRes] = await Promise.all([
      supabase.rpc("get_dashboard_metrics"),
      supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("customer_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (metricsRes.error) {
      // Fallback to computing metrics directly if get_dashboard_metrics RPC isn't installed yet
      if (
        metricsRes.error.message.includes("schema cache") ||
        metricsRes.error.code === "PGRST202"
      ) {
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from("orders").select("status, payment_method, total_pkr, items:order_items(*)"),
          supabase.from("products").select("id, variants:product_variants(id, stock)"),
        ]);
        const orders = (ordersRes.data || []) as Row[];
        const prods = (productsRes.data || []) as Row[];

        let totalRevenue = 0;
        let pendingOrders = 0;
        let fulfilledOrders = 0;
        const payMap = new Map<string, { order_count: number; revenue_pkr: number }>();
        const skuMap = new Map<
          string,
          { sku: string; product_title: string; variant_title: string; units_sold: number; revenue_pkr: number }
        >();

        for (const o of orders) {
          const st = str(o.status);
          const tot = num(o.total_pkr);
          if (st !== "cancelled") {
            totalRevenue += tot;
            const pm = str(o.payment_method) || "cod";
            const cur = payMap.get(pm) || { order_count: 0, revenue_pkr: 0 };
            cur.order_count += 1;
            cur.revenue_pkr += tot;
            payMap.set(pm, cur);
          }
          if (st === "pending") pendingOrders += 1;
          if (st === "shipped" || st === "delivered") fulfilledOrders += 1;

          for (const it of (o.items as Row[]) || []) {
            const sku = str(it.sku);
            const cur = skuMap.get(sku) || {
              sku,
              product_title: str(it.product_title),
              variant_title: str(it.variant_title),
              units_sold: 0,
              revenue_pkr: 0,
            };
            cur.units_sold += num(it.quantity);
            cur.revenue_pkr += num(it.total_pkr);
            skuMap.set(sku, cur);
          }
        }

        let totalSkus = 0;
        let totalUnits = 0;
        let lowStock = 0;
        for (const p of prods) {
          for (const v of (p.variants as Row[]) || []) {
            totalSkus += 1;
            const stock = num(v.stock);
            totalUnits += stock;
            if (stock <= 5) lowStock += 1;
          }
        }

        return {
          orderSummary: {
            total_orders: orders.length,
            total_revenue_pkr: totalRevenue,
            pending_orders: pendingOrders,
            fulfilled_orders: fulfilledOrders,
          },
          inventorySummary: {
            total_products: prods.length,
            total_skus: totalSkus,
            total_units_in_stock: totalUnits,
            low_stock_skus: lowStock,
          },
          paymentBreakdown: Array.from(payMap.entries()).map(([payment_method, v]) => ({
            payment_method,
            ...v,
          })),
          topSellingSkus: Array.from(skuMap.values())
            .sort((a, b) => b.revenue_pkr - a.revenue_pkr)
            .slice(0, 5),
          recentAuditLogs: ((auditRes.data || []) as Row[]).map(mapAuditRow),
          customerInquiries: ((inquiryRes.data || []) as Row[]).map(mapInquiryRow),
        };
      }
      throw new Error(`Load dashboard metrics: ${metricsRes.error.message}`);
    }
    const metrics = metricsRes.data as Pick<
      DashboardMetrics,
      "orderSummary" | "inventorySummary" | "paymentBreakdown" | "topSellingSkus"
    >;

    return {
      orderSummary: metrics.orderSummary,
      inventorySummary: metrics.inventorySummary,
      paymentBreakdown: metrics.paymentBreakdown,
      topSellingSkus: metrics.topSellingSkus,
      recentAuditLogs: ((auditRes.data || []) as Row[]).map(mapAuditRow),
      customerInquiries: ((inquiryRes.data || []) as Row[]).map(mapInquiryRow),
    };
  },
};

export const InquiryRepository = {
  async create(input: {
    name: string;
    phone: string;
    email?: string;
    message: string;
  }): Promise<CustomerInquiry> {
    const supabase = createAdminClient();
    const id = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    const created: CustomerInquiry = {
      id,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || undefined,
      message: input.message.trim(),
      status: "unread",
      created_at: nowIso,
    };

    const { error } = await supabase.from("customer_inquiries").insert({
      id,
      name: created.name,
      phone: created.phone,
      email: created.email ?? "",
      message: created.message,
      status: "unread",
      created_at: nowIso,
    });
    if (error) throw new Error(`Save inquiry: ${error.message}`);

    await appendAuditLog({
      actor: created.phone,
      action: "CUSTOMER_INQUIRY_RECEIVED",
      entity_type: "inquiry",
      entity_id: id,
      details: `Inquiry from ${created.name} (${created.phone}): "${created.message.slice(0, 60)}"`,
    });
    return created;
  },

  async getAll(): Promise<CustomerInquiry[]> {
    const supabase = createAdminClient();
    const rows = check(
      await supabase
        .from("customer_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      "Load inquiries"
    ) as Row[];
    return rows.map(mapInquiryRow);
  },

  async markResolved(id: string, actor = "admin"): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("customer_inquiries")
      .update({ status: "resolved" })
      .eq("id", id);
    if (error) throw new Error(`Resolve inquiry: ${error.message}`);

    await appendAuditLog({
      actor,
      action: "INQUIRY_RESOLVED",
      entity_type: "inquiry",
      entity_id: id,
      details: `Marked customer inquiry ${id} as resolved`,
    });
  },
};

// ============================================================================
// 5. ADMIN USERS & BOOTSTRAP
// ============================================================================

export interface AdminUserRecord {
  id: string;
  username: string;
  password_hash: string;
  role: string;
}

export const AdminUserRepository = {
  async findByUsername(username: string): Promise<AdminUserRecord | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash, role")
      .eq("username", username)
      .maybeSingle();
    if (error) {
      if (error.message.includes("schema cache") || error.code === "PGRST205") {
        return null;
      }
      throw new Error(`Load admin user: ${error.message}`);
    }
    return data
      ? {
          id: String(data.id),
          username: String(data.username),
          password_hash: String(data.password_hash),
          role: String(data.role),
        }
      : null;
  },

  async touchLastLogin(id: string): Promise<void> {
    const supabase = createAdminClient();
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", id);
  },
};

/**
 * Inserts the default categories, shipping zones and store settings when they
 * are missing. Used by the seed script only; the running site never seeds.
 */
export async function ensureCoreConfig(): Promise<void> {
  const supabase = createAdminClient();

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });
  if (!categoryCount) {
    const { error } = await supabase.from("categories").upsert(
      DEFAULT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        image_url: c.image_url || "",
        display_order: c.display_order || 1,
      }))
    );
    if (error) throw new Error(`Seed categories: ${error.message}`);
  }

  const { count: zoneCount } = await supabase
    .from("shipping_zones")
    .select("id", { count: "exact", head: true });
  if (!zoneCount) {
    const { error } = await supabase.from("shipping_zones").upsert(
      DEFAULT_SHIPPING_ZONES.map((z) => ({
        id: z.id,
        zone_name: z.zone_name,
        cities: z.cities,
        base_weight_grams: z.base_weight_grams,
        base_rate_pkr: z.base_rate_pkr,
        per_kg_extra_pkr: z.per_kg_extra_pkr,
        free_shipping_threshold_pkr: z.free_shipping_threshold_pkr,
        cod_fee_pkr: z.cod_fee_pkr,
      }))
    );
    if (error) throw new Error(`Seed shipping zones: ${error.message}`);
  }

  const { count: settingsCount } = await supabase
    .from("store_settings")
    .select("id", { count: "exact", head: true });
  if (!settingsCount) {
    const { error } = await supabase.from("store_settings").upsert({
      id: 1,
      settings_json: getDefaultStoreSettings(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Seed store settings: ${error.message}`);
  }
}

// ============================================================================
// ROW MAPPERS
// ============================================================================

function mapCategoryRow(r: Row): Category {
  return {
    id: str(r.id),
    name: str(r.name),
    slug: str(r.slug),
    description: str(r.description),
    image_url: str(r.image_url),
    display_order: num(r.display_order, 1),
  };
}

function mapVariantRow(r: Row): ProductVariant {
  return {
    id: str(r.id),
    product_id: str(r.product_id),
    sku: str(r.sku),
    title: str(r.title),
    price: num(r.price),
    compare_at_price:
      r.compare_at_price !== null && r.compare_at_price !== undefined
        ? num(r.compare_at_price)
        : undefined,
    stock: num(r.stock),
    weight_grams: num(r.weight_grams, 500) || 500,
    dimensions: (r.dimensions as ProductVariant["dimensions"]) || {
      length_cm: 30,
      width_cm: 30,
      height_cm: 12,
    },
    piece_count: num(r.piece_count, 1) || 1,
    attributes: (r.attributes as Record<string, string>) || {},
    is_active: Boolean(r.is_active),
  };
}

function mapImageRow(r: Row): ProductImage {
  return {
    id: str(r.id),
    product_id: str(r.product_id),
    variant_id: r.variant_id ? str(r.variant_id) : null,
    image_url: str(r.image_url),
    alt_text: str(r.alt_text),
    is_primary: Boolean(r.is_primary),
    display_order: num(r.display_order, 1) || 1,
  };
}

function mapEmbeddedProductRow(r: Row): Product {
  const variants = ((r.variants as Row[]) || [])
    .map(mapVariantRow)
    .sort((a, b) => a.price - b.price);
  const images = ((r.images as Row[]) || [])
    .map(mapImageRow)
    .sort((a, b) => a.display_order - b.display_order);

  return {
    id: str(r.id),
    name: str(r.name),
    slug: str(r.slug),
    description: str(r.description),
    category_id: str(r.category_id),
    material: str(r.material),
    care_instructions: (r.care_instructions as Product["care_instructions"]) || {
      dishwasher_safe: true,
      microwave_safe: true,
      oven_safe: false,
      handwash_only: false,
    },
    is_fragile: Boolean(r.is_fragile),
    breakage_guarantee: str(r.breakage_guarantee),
    is_featured: Boolean(r.is_featured),
    is_published: Boolean(r.is_published),
    seo_title: r.seo_title ? str(r.seo_title) : undefined,
    seo_description: r.seo_description ? str(r.seo_description) : undefined,
    rating: num(r.rating),
    review_count: num(r.review_count),
    variants,
    images,
  };
}

function mapOrderItemRow(r: Row): OrderItem {
  return {
    id: str(r.id),
    order_id: str(r.order_id),
    variant_id: str(r.variant_id),
    product_title: str(r.product_title),
    variant_title: str(r.variant_title),
    sku: str(r.sku),
    price_pkr: num(r.price_pkr),
    quantity: num(r.quantity),
    total_pkr: num(r.total_pkr),
    image_url: r.image_url ? str(r.image_url) : undefined,
  };
}

function mapOrderRow(r: Row): Order {
  return {
    id: str(r.id),
    order_number: str(r.order_number),
    customer_id: r.customer_id ? str(r.customer_id) : null,
    guest_info: r.guest_info as Order["guest_info"],
    status: r.status as OrderStatus,
    payment_status: r.payment_status as PaymentStatus,
    payment_method: (r.payment_method || "cod") as PaymentProviderId,
    shipping_address: r.shipping_address as Order["shipping_address"],
    subtotal_pkr: num(r.subtotal_pkr),
    discount_pkr: num(r.discount_pkr),
    shipping_fee_pkr: num(r.shipping_fee_pkr),
    cod_fee_pkr: num(r.cod_fee_pkr),
    fragile_packaging_fee_pkr: num(r.fragile_packaging_fee_pkr),
    total_pkr: num(r.total_pkr),
    notes: r.notes ? str(r.notes) : undefined,
    courier_code: (r.courier_code || "tcs") as CourierCode,
    tracking_number: r.tracking_number ? str(r.tracking_number) : undefined,
    tracking_url: r.tracking_url ? str(r.tracking_url) : undefined,
    payment_proof_url: r.payment_proof_url ? str(r.payment_proof_url) : undefined,
    items: ((r.items as Row[]) || []).map(mapOrderItemRow),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

function mapDiscountRow(r: Row): DiscountCode {
  return {
    id: str(r.id),
    code: str(r.code),
    description: str(r.description),
    discount_type: r.discount_type as "percentage" | "fixed",
    discount_value: num(r.discount_value),
    min_order_amount_pkr: num(r.min_order_amount_pkr),
    usage_limit:
      r.usage_limit !== null && r.usage_limit !== undefined
        ? num(r.usage_limit)
        : undefined,
    times_used: num(r.times_used),
    is_active: Boolean(r.is_active),
  };
}

function mapShippingZoneRow(r: Row): ShippingZone {
  return {
    id: str(r.id),
    zone_name: str(r.zone_name),
    cities: Array.isArray(r.cities) ? (r.cities as string[]) : [],
    base_weight_grams: num(r.base_weight_grams),
    base_rate_pkr: num(r.base_rate_pkr),
    per_kg_extra_pkr: num(r.per_kg_extra_pkr),
    free_shipping_threshold_pkr: num(r.free_shipping_threshold_pkr),
    cod_fee_pkr: num(r.cod_fee_pkr),
  };
}

function mapInquiryRow(r: Row): CustomerInquiry {
  return {
    id: str(r.id),
    name: str(r.name),
    phone: str(r.phone),
    email: r.email ? str(r.email) : undefined,
    message: str(r.message),
    status: (r.status as CustomerInquiry["status"]) || "unread",
    created_at: str(r.created_at),
  };
}

function mapAuditRow(r: Row): AuditLogEntry {
  return {
    id: str(r.id),
    actor: str(r.actor),
    action: str(r.action),
    entity_type: str(r.entity_type),
    entity_id: str(r.entity_id),
    details: str(r.details),
    ip_address: r.ip_address ? str(r.ip_address) : undefined,
    created_at: str(r.created_at),
  };
}
