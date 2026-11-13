import { createAdminClient } from "../lib/supabase/admin";
import {
  CatalogRepository,
  DiscountRepository,
  InquiryRepository,
  OrderRepository,
  SettingsRepository,
} from "../lib/db/repositories";

async function syncAllToSupabase() {
  console.log("🔄 Syncing local SQLite data to Supabase (adlfklahiygvwwrfkoqi.supabase.co)...");
  const supabase = createAdminClient();

  // 1. Categories
  const categories = CatalogRepository.getAllCategories();
  for (const cat of categories) {
    const { error } = await supabase.from("categories").upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image_url: cat.image_url || "/logo-card.jpg",
      display_order: cat.display_order,
    });
    if (error) console.warn("Category sync warning:", error.message);
  }
  console.log(`✓ Synced ${categories.length} categories`);

  // 2. Shipping Zones & Store Settings
  const zones = SettingsRepository.getShippingZones();
  for (const zone of zones) {
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
  }
  const settings = SettingsRepository.getStoreSettings();
  await supabase.from("store_settings").upsert({
    id: 1,
    settings_json: settings,
    updated_at: new Date().toISOString(),
  });
  console.log(`✓ Synced ${zones.length} shipping zones & store settings`);

  // 3. Products, Variants & Images
  const products = CatalogRepository.getAllProducts({ includeUnpublished: true });
  for (const product of products) {
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
  }
  console.log(`✓ Synced ${products.length} products (with variants & images)`);

  // 4. Orders & Order Items
  const orders = OrderRepository.getAllOrders();
  for (const order of orders) {
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

    await supabase.from("order_items").delete().eq("order_id", order.id);
    if (order.items && order.items.length > 0) {
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
  }
  console.log(`✓ Synced ${orders.length} orders (with order items)`);

  // 5. Discounts
  const discounts = DiscountRepository.getAll();
  for (const d of discounts) {
    await supabase.from("discounts").upsert({
      id: d.id,
      code: d.code.toUpperCase(),
      description: d.description || "",
      discount_type: d.discount_type,
      discount_value: d.discount_value,
      min_order_amount_pkr: d.min_order_amount_pkr || 0,
      usage_limit: d.usage_limit ?? null,
      times_used: d.times_used || 0,
      is_active: Boolean(d.is_active),
    });
  }
  console.log(`✓ Synced ${discounts.length} discounts`);

  // 6. Customer Inquiries
  const inquiries = InquiryRepository.getAll();
  for (const inq of inquiries) {
    await supabase.from("customer_inquiries").upsert({
      id: inq.id,
      name: inq.name,
      phone: inq.phone,
      email: inq.email || "",
      message: inq.message,
      status: inq.status,
      created_at: inq.created_at,
    });
  }
  console.log(`✓ Synced ${inquiries.length} customer inquiries`);
  console.log("🎉 Supabase cloud synchronization complete!");
}

syncAllToSupabase().catch((err) => {
  console.error("Supabase sync error:", err);
  process.exit(1);
});
