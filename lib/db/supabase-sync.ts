import { createAdminClient } from "@/lib/supabase/admin";
import {
  Category,
  CustomerInquiry,
  DiscountCode,
  Order,
  Product,
  ShippingZone,
  StoreSettings,
} from "@/types";

function isSupabaseReady(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !url.includes("placeholder")
  );
}

/**
 * Non-blocking Supabase cloud replication layer.
 * Keeps Supabase PostgreSQL (adlfklahiygvwwrfkoqi.supabase.co) synchronized
 * with every write performed on the local SQLite WAL engine.
 */
export const SupabaseSync = {
  upsertCategory(category: Category): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("categories").upsert({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          image_url: category.image_url || "/logo-card.jpg",
          display_order: category.display_order,
        });
      } catch {
        // Ignore background sync errors when offline
      }
    })();
  },

  deleteCategory(categoryId: string): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("categories").delete().eq("id", categoryId);
      } catch {}
    })();
  },

  upsertProduct(product: Product): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("products").upsert({
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
          is_published: product.is_published,
          seo_title: product.seo_title ?? null,
          seo_description: product.seo_description ?? null,
          rating: product.rating ?? 0,
          review_count: product.review_count ?? 0,
          updated_at: new Date().toISOString(),
        });

        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", product.id);
        if (product.variants.length > 0) {
          await supabase.from("product_variants").insert(
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
        }

        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", product.id);
        if (product.images.length > 0) {
          await supabase.from("product_images").insert(
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
        }
      } catch {}
    })();
  },

  deleteProduct(productId: string): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("products").delete().eq("id", productId);
      } catch {}
    })();
  },

  upsertOrder(order: Order): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("orders").upsert({
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
          courier_code: order.courier_code || "manual",
          tracking_number: order.tracking_number ?? null,
          tracking_url: order.tracking_url ?? null,
          payment_proof_url: order.payment_proof_url ?? null,
          created_at: order.created_at,
          updated_at: order.updated_at,
        });

        if (order.items && order.items.length > 0) {
          await supabase
            .from("order_items")
            .delete()
            .eq("order_id", order.id);
          await supabase.from("order_items").insert(
            order.items.map((item) => ({
              id: item.id,
              order_id: order.id,
              variant_id: item.variant_id,
              product_title: item.product_title,
              variant_title: item.variant_title,
              sku: item.sku,
              price_pkr: item.price_pkr,
              quantity: item.quantity,
              total_pkr: item.total_pkr,
              image_url: item.image_url ?? null,
            }))
          );
        }
      } catch {}
    })();
  },

  deleteOrder(orderId: string): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("orders").delete().eq("id", orderId);
      } catch {}
    })();
  },

  upsertDiscount(discount: DiscountCode): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("discounts").upsert({
          id: discount.id,
          code: discount.code.toUpperCase(),
          description: discount.description || "",
          discount_type: discount.discount_type,
          discount_value: discount.discount_value,
          min_order_amount_pkr: discount.min_order_amount_pkr || 0,
          usage_limit: discount.usage_limit ?? null,
          times_used: discount.times_used || 0,
          is_active: Boolean(discount.is_active),
        });
      } catch {}
    })();
  },

  deleteDiscount(discountId: string): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("discounts").delete().eq("id", discountId);
      } catch {}
    })();
  },

  upsertShippingZone(zone: ShippingZone): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("shipping_zones").upsert({
          id: zone.id,
          zone_name: zone.zone_name,
          cities: zone.cities,
          base_weight_grams: zone.base_weight_grams,
          base_rate_pkr: zone.base_rate_pkr,
          per_kg_extra_pkr: zone.per_kg_extra_pkr,
          free_shipping_threshold_pkr: zone.free_shipping_threshold_pkr,
          cod_fee_pkr: zone.cod_fee_pkr,
        });
      } catch {}
    })();
  },

  upsertStoreSettings(settings: StoreSettings): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("store_settings").upsert({
          id: 1,
          settings_json: settings,
          updated_at: new Date().toISOString(),
        });
      } catch {}
    })();
  },

  upsertInquiry(inquiry: CustomerInquiry): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("customer_inquiries").upsert({
          id: inquiry.id,
          name: inquiry.name,
          phone: inquiry.phone,
          email: inquiry.email || "",
          message: inquiry.message,
          status: inquiry.status,
          created_at: inquiry.created_at,
        });
      } catch {}
    })();
  },

  insertAuditLog(entry: {
    actor: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: string;
    created_at?: string;
  }): void {
    if (!isSupabaseReady()) return;
    void (async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from("audit_logs").insert({
          actor: entry.actor,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          details: entry.details,
          created_at: entry.created_at || new Date().toISOString(),
        });
      } catch {}
    })();
  },
};

