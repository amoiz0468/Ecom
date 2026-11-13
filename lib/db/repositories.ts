import {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CourierCode,
  ShippingZone,
  DiscountCode,
  StoreSettings,
  CustomerInquiry,
} from "@/types";
import {
  getSqliteDb,
  withTransaction,
  appendAuditLog,
  getDefaultStoreSettings,
  AuditLogEntry,
} from "@/lib/db/sqlite";
import { SupabaseSync } from "@/lib/db/supabase-sync";

// ============================================================================
// 1. CATALOG REPOSITORY (Categories, Products, Variants, Images)
// ============================================================================

export const CatalogRepository = {
  getAllCategories(): Category[] {
    const db = getSqliteDb();
    const rows = db
      .prepare("SELECT * FROM categories ORDER BY display_order ASC, name ASC")
      .all() as any[];

    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      description: r.description ? String(r.description) : "",
      image_url: r.image_url ? String(r.image_url) : "",
      display_order: Number(r.display_order || 1),
    }));
  },

  upsertCategory(category: Category, actor = "admin"): Category {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO categories (id, name, slug, description, image_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        slug = excluded.slug,
        description = excluded.description,
        image_url = excluded.image_url,
        display_order = excluded.display_order
    `).run(
      category.id,
      category.name,
      category.slug,
      category.description || "",
      category.image_url || "",
      category.display_order
    );

    appendAuditLog({
      actor,
      action: "UPSERT_CATEGORY",
      entity_type: "category",
      entity_id: category.id,
      details: `Saved category "${category.name}" (${category.slug})`,
    });

    SupabaseSync.upsertCategory(category);
    return category;
  },

  deleteCategory(categoryId: string, actor = "admin"): void {
    const db = getSqliteDb();
    db.prepare("DELETE FROM categories WHERE id = ?").run(categoryId);
    appendAuditLog({
      actor,
      action: "DELETE_CATEGORY",
      entity_type: "category",
      entity_id: categoryId,
      details: `Deleted category ${categoryId}`,
    });
    SupabaseSync.deleteCategory(categoryId);
  },

  getAllProducts(options?: {
    categorySlug?: string;
    query?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    featuredOnly?: boolean;
    includeUnpublished?: boolean;
    sort?: "price-asc" | "price-desc" | "newest" | "rating";
  }): Product[] {
    const db = getSqliteDb();

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (!options?.includeUnpublished) {
      whereClauses.push("p.is_published = 1");
    }

    if (options?.categorySlug) {
      whereClauses.push("c.slug = ?");
      params.push(options.categorySlug);
    }

    if (options?.featuredOnly) {
      whereClauses.push("p.is_featured = 1");
    }

    if (options?.material) {
      whereClauses.push("LOWER(p.material) = LOWER(?)");
      params.push(options.material);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const productRows = db
      .prepare(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ${whereSql}
         ORDER BY p.created_at DESC`
      )
      .all(...params) as any[];

    if (productRows.length === 0) return [];

    const productIds = productRows.map((r) => String(r.id));
    const placeholders = productIds.map(() => "?").join(",");

    const allVariants = db
      .prepare(
        `SELECT * FROM product_variants WHERE product_id IN (${placeholders}) ORDER BY price ASC`
      )
      .all(...productIds) as any[];

    const allImages = db
      .prepare(
        `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`
      )
      .all(...productIds) as any[];

    const variantsByProduct = new Map<string, ProductVariant[]>();
    for (const v of allVariants) {
      const pid = String(v.product_id);
      if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, []);
      variantsByProduct.get(pid)!.push(mapVariantRow(v));
    }

    const imagesByProduct = new Map<string, ProductImage[]>();
    for (const img of allImages) {
      const pid = String(img.product_id);
      if (!imagesByProduct.has(pid)) imagesByProduct.set(pid, []);
      imagesByProduct.get(pid)!.push(mapImageRow(img));
    }

    let products = productRows.map((row) =>
      mapProductRow(
        row,
        variantsByProduct.get(String(row.id)) || [],
        imagesByProduct.get(String(row.id)) || []
      )
    );

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

  getProductBySlug(slug: string, includeUnpublished = false): Product | null {
    const db = getSqliteDb();
    const row = db
      .prepare(
        `SELECT * FROM products WHERE slug = ? ${
          includeUnpublished ? "" : "AND is_published = 1"
        }`
      )
      .get(slug) as any;

    if (!row) return null;
    return this.hydrateSingleProduct(row);
  },

  getProductById(id: string): Product | null {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(id) as any;
    if (!row) return null;
    return this.hydrateSingleProduct(row);
  },

  hydrateSingleProduct(row: any): Product {
    const db = getSqliteDb();
    const variants = (
      db
        .prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC")
        .all(row.id) as any[]
    ).map(mapVariantRow);

    const images = (
      db
        .prepare(
          "SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC"
        )
        .all(row.id) as any[]
    ).map(mapImageRow);

    return mapProductRow(row, variants, images);
  },

  upsertProduct(product: Product, actor = "admin"): Product {
    return withTransaction((db) => {
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO products (
          id, name, slug, description, category_id, material,
          care_instructions_json, is_fragile, breakage_guarantee,
          is_featured, is_published, seo_title, seo_description,
          rating, review_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          description = excluded.description,
          category_id = excluded.category_id,
          material = excluded.material,
          care_instructions_json = excluded.care_instructions_json,
          is_fragile = excluded.is_fragile,
          breakage_guarantee = excluded.breakage_guarantee,
          is_featured = excluded.is_featured,
          is_published = excluded.is_published,
          seo_title = excluded.seo_title,
          seo_description = excluded.seo_description,
          updated_at = excluded.updated_at
      `).run(
        product.id,
        product.name,
        product.slug,
        product.description,
        product.category_id,
        product.material,
        JSON.stringify(product.care_instructions),
        product.is_fragile ? 1 : 0,
        product.breakage_guarantee,
        product.is_featured ? 1 : 0,
        product.is_published !== false ? 1 : 0,
        product.seo_title ?? null,
        product.seo_description ?? null,
        product.rating ?? 0,
        product.review_count ?? 0,
        nowIso,
        nowIso
      );

      db.prepare("DELETE FROM product_variants WHERE product_id = ?").run(product.id);
      const insertVar = db.prepare(`
        INSERT INTO product_variants (
          id, product_id, sku, title, price, compare_at_price,
          stock, weight_grams, dimensions_json, piece_count,
          attributes_json, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const v of product.variants) {
        insertVar.run(
          v.id,
          product.id,
          v.sku,
          v.title,
          v.price,
          v.compare_at_price ?? null,
          v.stock,
          v.weight_grams || 500,
          JSON.stringify(
            v.dimensions || { length_cm: 30, width_cm: 30, height_cm: 12 }
          ),
          v.piece_count || 1,
          JSON.stringify(v.attributes || {}),
          v.is_active !== false ? 1 : 0
        );
      }

      db.prepare("DELETE FROM product_images WHERE product_id = ?").run(product.id);
      const insertImg = db.prepare(`
        INSERT INTO product_images (
          id, product_id, variant_id, image_url, alt_text, is_primary, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const img of product.images) {
        insertImg.run(
          img.id,
          product.id,
          img.variant_id ?? null,
          img.image_url,
          img.alt_text || product.name,
          img.is_primary ? 1 : 0,
          img.display_order || 1
        );
      }

      appendAuditLog({
        actor,
        action: "UPSERT_PRODUCT",
        entity_type: "product",
        entity_id: product.id,
        details: `Saved product "${product.name}" with ${product.variants.length} variant(s)`,
      });

      SupabaseSync.upsertProduct(product);
      return product;
    });
  },

  updateVariantStockAndPrice(
    productId: string,
    variantId: string,
    newStock: number,
    newPrice: number,
    actor = "admin"
  ): Product | null {
    const db = getSqliteDb();
    const cleanStock = Math.max(0, Math.round(newStock));
    const cleanPrice = Math.max(0, Math.round(newPrice));

    db.prepare(`
      UPDATE product_variants
      SET stock = ?, price = ?
      WHERE id = ? AND product_id = ?
    `).run(cleanStock, cleanPrice, variantId, productId);

    db.prepare("UPDATE products SET updated_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      productId
    );

    appendAuditLog({
      actor,
      action: "UPDATE_VARIANT_INVENTORY",
      entity_type: "product_variant",
      entity_id: variantId,
      details: `Updated variant ${variantId} -> stock: ${cleanStock}, price: Rs. ${cleanPrice}`,
    });

    const updated = this.getProductById(productId);
    if (updated) SupabaseSync.upsertProduct(updated);
    return updated;
  },

  toggleProductFlag(
    productId: string,
    field: "is_published" | "is_featured",
    actor = "admin"
  ): Product | null {
    const db = getSqliteDb();
    const row = db
      .prepare(`SELECT ${field} FROM products WHERE id = ?`)
      .get(productId) as any;
    if (!row) return null;

    const nextVal = row[field] ? 0 : 1;
    db.prepare(
      `UPDATE products SET ${field} = ?, updated_at = ? WHERE id = ?`
    ).run(nextVal, new Date().toISOString(), productId);

    appendAuditLog({
      actor,
      action: "TOGGLE_PRODUCT_FLAG",
      entity_type: "product",
      entity_id: productId,
      details: `Toggled ${field} to ${Boolean(nextVal)}`,
    });

    const updated = this.getProductById(productId);
    if (updated) SupabaseSync.upsertProduct(updated);
    return updated;
  },

  deleteProduct(productId: string, actor = "admin"): void {
    const db = getSqliteDb();
    db.prepare("DELETE FROM products WHERE id = ?").run(productId);
    appendAuditLog({
      actor,
      action: "DELETE_PRODUCT",
      entity_type: "product",
      entity_id: productId,
      details: `Deleted product ${productId}`,
    });
    SupabaseSync.deleteProduct(productId);
  },
};

// ============================================================================
// 2. ORDER REPOSITORY (Atomic ACID Checkout & Fulfillment)
// ============================================================================

export const OrderRepository = {
  createOrderTransaction(
    order: Order,
    appliedCouponCode?: string
  ): Order {
    return withTransaction((db) => {
      // 1. Verify and deduct variant stock inside the transaction
      for (const item of order.items) {
        const variantRow = db
          .prepare("SELECT id, stock, title, sku FROM product_variants WHERE id = ?")
          .get(item.variant_id) as
          | { id: string; stock: number; title: string; sku: string }
          | undefined;

        if (variantRow) {
          if (variantRow.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${item.product_title} (${variantRow.title})". Only ${variantRow.stock} left.`
            );
          }
          db.prepare(
            "UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?"
          ).run(item.quantity, item.variant_id);
        }
      }

      // 2. Increment coupon usage if applicable
      if (appliedCouponCode) {
        db.prepare(
          "UPDATE discounts SET times_used = times_used + 1 WHERE UPPER(code) = UPPER(?)"
        ).run(appliedCouponCode.trim());
      }

      // 3. Insert Order
      db.prepare(`
        INSERT INTO orders (
          id, order_number, customer_id, guest_info_json, status,
          payment_status, payment_method, shipping_address_json,
          subtotal_pkr, discount_pkr, shipping_fee_pkr, cod_fee_pkr,
          fragile_packaging_fee_pkr, total_pkr, notes, courier_code,
          tracking_number, tracking_url, payment_proof_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        order.id,
        order.order_number,
        order.customer_id ?? null,
        JSON.stringify(order.guest_info),
        order.status,
        order.payment_status,
        order.payment_method || "cod",
        JSON.stringify(order.shipping_address),
        order.subtotal_pkr,
        order.discount_pkr,
        order.shipping_fee_pkr,
        order.cod_fee_pkr,
        order.fragile_packaging_fee_pkr,
        order.total_pkr,
        order.notes ?? null,
        order.courier_code || "tcs",
        order.tracking_number ?? null,
        order.tracking_url ?? null,
        order.payment_proof_url ?? null,
        order.created_at,
        order.updated_at
      );

      // 4. Insert Order Items
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          id, order_id, variant_id, product_title, variant_title,
          sku, price_pkr, quantity, total_pkr, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const i of order.items) {
        insertItem.run(
          i.id,
          order.id,
          i.variant_id,
          i.product_title,
          i.variant_title,
          i.sku,
          i.price_pkr,
          i.quantity,
          i.total_pkr,
          i.image_url ?? null
        );
      }

      // 5. Record Audit Log
      appendAuditLog({
        actor: order.guest_info.email || order.guest_info.phone || "guest",
        action: "ORDER_PLACED",
        entity_type: "order",
        entity_id: order.order_number,
        details: `Placed order ${order.order_number} for Rs. ${order.total_pkr.toLocaleString()} (${order.payment_method?.toUpperCase()})`,
      });

      SupabaseSync.upsertOrder(order);
      return order;
    });
  },

  getOrderByIdOrNumber(idOrNumber: string): Order | null {
    const db = getSqliteDb();
    const clean = idOrNumber.trim();
    const row = db
      .prepare(
        "SELECT * FROM orders WHERE id = ? OR UPPER(order_number) = UPPER(?)"
      )
      .get(clean, clean) as any;

    if (!row) return null;

    const itemRows = db
      .prepare("SELECT * FROM order_items WHERE order_id = ?")
      .all(row.id) as any[];

    return mapOrderRow(row, itemRows.map(mapOrderItemRow));
  },

  getAllOrders(options?: { limit?: number; offset?: number }): Order[] {
    const db = getSqliteDb();
    const hasPagination =
      typeof options?.limit === "number" && options.limit > 0;
    const orderRows = hasPagination
      ? (db
          .prepare(
            "SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?"
          )
          .all(
            Math.min(500, Math.floor(options!.limit!)),
            Math.max(0, Math.floor(options?.offset || 0))
          ) as Record<string, unknown>[])
      : (db
          .prepare("SELECT * FROM orders ORDER BY created_at DESC")
          .all() as Record<string, unknown>[]);

    if (orderRows.length === 0) return [];

    const itemRows = db
      .prepare("SELECT * FROM order_items")
      .all() as Record<string, unknown>[];
    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const r of itemRows) {
      const oid = String(r.order_id);
      if (!itemsByOrder.has(oid)) itemsByOrder.set(oid, []);
      itemsByOrder.get(oid)!.push(mapOrderItemRow(r));
    }

    return orderRows.map((row) =>
      mapOrderRow(row, itemsByOrder.get(String(row.id)) || [])
    );
  },

  updateOrderStatusTransaction(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus,
    trackingNumber?: string,
    courierCode?: CourierCode,
    actor = "admin"
  ): Order | null {
    return withTransaction((db) => {
      const existing = this.getOrderByIdOrNumber(orderId);
      if (!existing) return null;

      const nextPaymentStatus = paymentStatus || existing.payment_status;
      const nextTracking =
        trackingNumber !== undefined ? trackingNumber : existing.tracking_number;
      const nextCourier = courierCode || existing.courier_code;
      const nowIso = new Date().toISOString();

      // Restore stock automatically if transitioning into "cancelled"
      if (status === "cancelled" && existing.status !== "cancelled") {
        for (const item of existing.items) {
          db.prepare(
            "UPDATE product_variants SET stock = stock + ? WHERE id = ?"
          ).run(item.quantity, item.variant_id);
        }
      }

      db.prepare(`
        UPDATE orders
        SET status = ?, payment_status = ?, tracking_number = ?, courier_code = ?, updated_at = ?
        WHERE id = ?
      `).run(
        status,
        nextPaymentStatus,
        nextTracking ?? null,
        nextCourier,
        nowIso,
        existing.id
      );

      appendAuditLog({
        actor,
        action: "ORDER_STATUS_UPDATED",
        entity_type: "order",
        entity_id: existing.order_number,
        details: `Order ${existing.order_number}: ${existing.status} -> ${status} (payment: ${nextPaymentStatus})`,
      });

      const updatedOrder = this.getOrderByIdOrNumber(existing.id);
      if (updatedOrder) SupabaseSync.upsertOrder(updatedOrder);
      return updatedOrder;
    });
  },

  attachPaymentProof(orderIdOrNumber: string, proofUrl: string): Order | null {
    const db = getSqliteDb();
    const existing = this.getOrderByIdOrNumber(orderIdOrNumber);
    if (!existing) return null;

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE orders
      SET payment_proof_url = ?, payment_status = 'awaiting_verification', updated_at = ?
      WHERE id = ?
    `).run(proofUrl, nowIso, existing.id);

    appendAuditLog({
      actor: existing.guest_info.phone || "customer",
      action: "PAYMENT_PROOF_UPLOADED",
      entity_type: "order",
      entity_id: existing.order_number,
      details: `Customer uploaded transfer receipt for ${existing.order_number}: ${proofUrl}`,
    });

    const updatedOrder = this.getOrderByIdOrNumber(existing.id);
    if (updatedOrder) SupabaseSync.upsertOrder(updatedOrder);
    return updatedOrder;
  },

  deleteOrder(orderId: string, actor = "admin"): void {
    withTransaction((db) => {
      const existing = this.getOrderByIdOrNumber(orderId);
      if (!existing) return;

      if (existing.status !== "cancelled") {
        for (const item of existing.items) {
          db.prepare(
            "UPDATE product_variants SET stock = stock + ? WHERE id = ?"
          ).run(item.quantity, item.variant_id);
        }
      }

      db.prepare("DELETE FROM orders WHERE id = ?").run(existing.id);

      appendAuditLog({
        actor,
        action: "ORDER_DELETED",
        entity_type: "order",
        entity_id: existing.order_number,
        details: `Deleted order ${existing.order_number}`,
      });
      SupabaseSync.deleteOrder(existing.id);
    });
  },
};

// ============================================================================
// 3. DISCOUNTS, SHIPPING ZONES & SETTINGS REPOSITORY
// ============================================================================

export const DiscountRepository = {
  getAll(): DiscountCode[] {
    const db = getSqliteDb();
    const rows = db
      .prepare("SELECT * FROM discounts ORDER BY code ASC")
      .all() as any[];

    return rows.map(mapDiscountRow);
  },

  findByCode(code: string): DiscountCode | null {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM discounts WHERE UPPER(code) = UPPER(?)")
      .get(code.trim()) as any;
    return row ? mapDiscountRow(row) : null;
  },

  upsert(discount: DiscountCode, actor = "admin"): DiscountCode {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO discounts (
        id, code, description, discount_type, discount_value,
        min_order_amount_pkr, usage_limit, times_used, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        description = excluded.description,
        discount_type = excluded.discount_type,
        discount_value = excluded.discount_value,
        min_order_amount_pkr = excluded.min_order_amount_pkr,
        usage_limit = excluded.usage_limit,
        is_active = excluded.is_active
    `).run(
      discount.id,
      discount.code.toUpperCase(),
      discount.description,
      discount.discount_type,
      discount.discount_value,
      discount.min_order_amount_pkr,
      discount.usage_limit ?? null,
      discount.times_used || 0,
      discount.is_active ? 1 : 0
    );

    appendAuditLog({
      actor,
      action: "UPSERT_DISCOUNT",
      entity_type: "discount",
      entity_id: discount.code,
      details: `Saved promo code ${discount.code} (${discount.discount_value} ${discount.discount_type})`,
    });

    SupabaseSync.upsertDiscount(discount);
    return discount;
  },

  toggleStatus(discountId: string, actor = "admin"): void {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT is_active, code FROM discounts WHERE id = ?")
      .get(discountId) as { is_active: number; code: string } | undefined;
    if (!row) return;
    const next = row.is_active ? 0 : 1;
    db.prepare("UPDATE discounts SET is_active = ? WHERE id = ?").run(
      next,
      discountId
    );
    appendAuditLog({
      actor,
      action: "TOGGLE_DISCOUNT",
      entity_type: "discount",
      entity_id: row.code,
      details: `Set coupon ${row.code} active = ${Boolean(next)}`,
    });
    const updated = this.findByCode(row.code);
    if (updated) SupabaseSync.upsertDiscount(updated);
  },

  delete(discountId: string, actor = "admin"): void {
    const db = getSqliteDb();
    db.prepare("DELETE FROM discounts WHERE id = ?").run(discountId);
    appendAuditLog({
      actor,
      action: "DELETE_DISCOUNT",
      entity_type: "discount",
      entity_id: discountId,
      details: `Deleted discount ${discountId}`,
    });
    SupabaseSync.deleteDiscount(discountId);
  },
};

export const SettingsRepository = {
  getShippingZones(): ShippingZone[] {
    const db = getSqliteDb();
    const rows = db.prepare("SELECT * FROM shipping_zones").all() as any[];
    return rows.map((r) => ({
      id: String(r.id),
      zone_name: String(r.zone_name),
      cities: JSON.parse(String(r.cities_json || "[]")),
      base_weight_grams: Number(r.base_weight_grams),
      base_rate_pkr: Number(r.base_rate_pkr),
      per_kg_extra_pkr: Number(r.per_kg_extra_pkr),
      free_shipping_threshold_pkr: Number(r.free_shipping_threshold_pkr),
      cod_fee_pkr: Number(r.cod_fee_pkr),
    }));
  },

  updateShippingZone(
    zoneId: string,
    updates: Partial<ShippingZone>,
    actor = "admin"
  ): ShippingZone[] {
    const db = getSqliteDb();
    const existing = this.getShippingZones().find((z) => z.id === zoneId);
    if (existing) {
      const merged: ShippingZone = {
        ...existing,
        base_rate_pkr:
          updates.base_rate_pkr !== undefined
            ? Math.max(0, Math.round(Number(updates.base_rate_pkr)))
            : existing.base_rate_pkr,
        per_kg_extra_pkr:
          updates.per_kg_extra_pkr !== undefined
            ? Math.max(0, Math.round(Number(updates.per_kg_extra_pkr)))
            : existing.per_kg_extra_pkr,
        free_shipping_threshold_pkr:
          updates.free_shipping_threshold_pkr !== undefined
            ? Math.max(0, Math.round(Number(updates.free_shipping_threshold_pkr)))
            : existing.free_shipping_threshold_pkr,
        cod_fee_pkr:
          updates.cod_fee_pkr !== undefined
            ? Math.max(0, Math.round(Number(updates.cod_fee_pkr)))
            : existing.cod_fee_pkr,
      };

      db.prepare(`
        UPDATE shipping_zones
        SET base_rate_pkr = ?, per_kg_extra_pkr = ?, free_shipping_threshold_pkr = ?, cod_fee_pkr = ?
        WHERE id = ?
      `).run(
        merged.base_rate_pkr,
        merged.per_kg_extra_pkr,
        merged.free_shipping_threshold_pkr,
        merged.cod_fee_pkr,
        zoneId
      );

      appendAuditLog({
        actor,
        action: "UPDATE_SHIPPING_ZONE",
        entity_type: "shipping_zone",
        entity_id: zoneId,
        details: `Updated rates for "${merged.zone_name}" (base: Rs. ${merged.base_rate_pkr})`,
      });
      SupabaseSync.upsertShippingZone(merged);
    }
    return this.getShippingZones();
  },

  getStoreSettings(): StoreSettings {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT settings_json FROM store_settings WHERE id = 1")
      .get() as { settings_json: string } | undefined;

    if (!row) return getDefaultStoreSettings();
    try {
      return { ...getDefaultStoreSettings(), ...JSON.parse(row.settings_json) };
    } catch {
      return getDefaultStoreSettings();
    }
  },

  updateStoreSettings(
    updates: Partial<StoreSettings>,
    actor = "admin"
  ): StoreSettings {
    const db = getSqliteDb();
    const merged = { ...this.getStoreSettings(), ...updates };
    db.prepare(`
      INSERT OR REPLACE INTO store_settings (id, settings_json, updated_at)
      VALUES (1, ?, ?)
    `).run(JSON.stringify(merged), new Date().toISOString());

    appendAuditLog({
      actor,
      action: "UPDATE_STORE_SETTINGS",
      entity_type: "store_settings",
      entity_id: "global",
      details: `Updated store configuration (${merged.store_name})`,
    });

    SupabaseSync.upsertStoreSettings(merged);
    return merged;
  },
};

// ============================================================================
// 4. ANALYTICS & AUDIT REPOSITORY (SQL Aggregations)
// ============================================================================

export const AnalyticsRepository = {
  getDashboardMetrics() {
    const db = getSqliteDb();

    const orderSummary = db
      .prepare(`
        SELECT
          COUNT(*) as total_orders,
          COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_pkr ELSE 0 END), 0) as total_revenue_pkr,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_orders,
          COALESCE(SUM(CASE WHEN status = 'shipped' OR status = 'delivered' THEN 1 ELSE 0 END), 0) as fulfilled_orders
        FROM orders
      `)
      .get() as {
      total_orders: number;
      total_revenue_pkr: number;
      pending_orders: number;
      fulfilled_orders: number;
    };

    const inventorySummary = db
      .prepare(`
        SELECT
          COUNT(DISTINCT p.id) as total_products,
          COUNT(v.id) as total_skus,
          COALESCE(SUM(v.stock), 0) as total_units_in_stock,
          COALESCE(SUM(CASE WHEN v.stock <= 5 THEN 1 ELSE 0 END), 0) as low_stock_skus
        FROM products p
        LEFT JOIN product_variants v ON p.id = v.product_id
      `)
      .get() as {
      total_products: number;
      total_skus: number;
      total_units_in_stock: number;
      low_stock_skus: number;
    };

    const paymentBreakdown = db
      .prepare(`
        SELECT
          payment_method,
          COUNT(*) as order_count,
          COALESCE(SUM(total_pkr), 0) as revenue_pkr
        FROM orders
        WHERE status != 'cancelled'
        GROUP BY payment_method
      `)
      .all() as {
      payment_method: string;
      order_count: number;
      revenue_pkr: number;
    }[];

    const topSellingSkus = db
      .prepare(`
        SELECT
          sku,
          product_title,
          variant_title,
          SUM(quantity) as units_sold,
          SUM(total_pkr) as revenue_pkr
        FROM order_items
        GROUP BY sku, product_title, variant_title
        ORDER BY revenue_pkr DESC
        LIMIT 5
      `)
      .all() as {
      sku: string;
      product_title: string;
      variant_title: string;
      units_sold: number;
      revenue_pkr: number;
    }[];

    const recentAuditLogs = db
      .prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 25")
      .all() as unknown as AuditLogEntry[];

    const customerInquiries = db
      .prepare("SELECT * FROM customer_inquiries ORDER BY created_at DESC LIMIT 20")
      .all() as unknown as CustomerInquiry[];

    return {
      orderSummary,
      inventorySummary,
      paymentBreakdown,
      topSellingSkus,
      recentAuditLogs,
      customerInquiries,
    };
  },
};

export const InquiryRepository = {
  create(input: {
    name: string;
    phone: string;
    email?: string;
    message: string;
  }): CustomerInquiry {
    const db = getSqliteDb();
    const id = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    db.prepare(`
      INSERT INTO customer_inquiries (id, name, phone, email, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'unread', ?)
    `).run(
      id,
      input.name.trim(),
      input.phone.trim(),
      input.email?.trim() || null,
      input.message.trim(),
      nowIso
    );

    appendAuditLog({
      actor: input.phone.trim(),
      action: "CUSTOMER_INQUIRY_RECEIVED",
      entity_type: "inquiry",
      entity_id: id,
      details: `Inquiry from ${input.name.trim()} (${input.phone.trim()}): "${input.message
        .trim()
        .slice(0, 60)}"`,
    });

    const created: CustomerInquiry = {
      id,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim(),
      message: input.message.trim(),
      status: "unread",
      created_at: nowIso,
    };
    SupabaseSync.upsertInquiry(created);
    return created;
  },

  getAll(): CustomerInquiry[] {
    const db = getSqliteDb();
    return db
      .prepare("SELECT * FROM customer_inquiries ORDER BY created_at DESC")
      .all() as unknown as CustomerInquiry[];
  },

  markResolved(id: string, actor = "admin"): void {
    const db = getSqliteDb();
    db.prepare(
      "UPDATE customer_inquiries SET status = 'resolved' WHERE id = ?"
    ).run(id);
    const updated = db
      .prepare("SELECT * FROM customer_inquiries WHERE id = ?")
      .get(id) as unknown as CustomerInquiry | undefined;
    if (updated) {
      SupabaseSync.upsertInquiry(updated);
    }
    appendAuditLog({
      actor,
      action: "INQUIRY_RESOLVED",
      entity_type: "inquiry",
      entity_id: id,
      details: `Marked customer inquiry ${id} as resolved`,
    });
  },
};

// ============================================================================
// ROW MAPPERS
// ============================================================================

function mapVariantRow(r: any): ProductVariant {
  return {
    id: String(r.id),
    product_id: String(r.product_id),
    sku: String(r.sku),
    title: String(r.title),
    price: Number(r.price),
    compare_at_price:
      r.compare_at_price !== null && r.compare_at_price !== undefined
        ? Number(r.compare_at_price)
        : undefined,
    stock: Number(r.stock),
    weight_grams: Number(r.weight_grams || 500),
    dimensions: JSON.parse(
      String(r.dimensions_json || '{"length_cm":30,"width_cm":30,"height_cm":12}')
    ),
    piece_count: Number(r.piece_count || 1),
    attributes: JSON.parse(String(r.attributes_json || "{}")),
    is_active: Boolean(r.is_active),
  };
}

function mapImageRow(r: any): ProductImage {
  return {
    id: String(r.id),
    product_id: String(r.product_id),
    variant_id: r.variant_id ? String(r.variant_id) : null,
    image_url: String(r.image_url),
    alt_text: String(r.alt_text),
    is_primary: Boolean(r.is_primary),
    display_order: Number(r.display_order || 1),
  };
}

function mapProductRow(
  r: any,
  variants: ProductVariant[],
  images: ProductImage[]
): Product {
  return {
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    description: String(r.description),
    category_id: String(r.category_id),
    material: String(r.material),
    care_instructions: JSON.parse(
      String(
        r.care_instructions_json ||
          '{"dishwasher_safe":true,"microwave_safe":true,"oven_safe":false,"handwash_only":false}'
      )
    ),
    is_fragile: Boolean(r.is_fragile),
    breakage_guarantee: String(r.breakage_guarantee),
    is_featured: Boolean(r.is_featured),
    is_published: Boolean(r.is_published),
    seo_title: r.seo_title ? String(r.seo_title) : undefined,
    seo_description: r.seo_description ? String(r.seo_description) : undefined,
    rating: r.rating !== null ? Number(r.rating) : 0,
    review_count: r.review_count !== null ? Number(r.review_count) : 0,
    variants,
    images,
  };
}

function mapOrderItemRow(r: any): OrderItem {
  return {
    id: String(r.id),
    order_id: String(r.order_id),
    variant_id: String(r.variant_id),
    product_title: String(r.product_title),
    variant_title: String(r.variant_title),
    sku: String(r.sku),
    price_pkr: Number(r.price_pkr),
    quantity: Number(r.quantity),
    total_pkr: Number(r.total_pkr),
    image_url: r.image_url ? String(r.image_url) : undefined,
  };
}

function mapOrderRow(r: any, items: OrderItem[]): Order {
  return {
    id: String(r.id),
    order_number: String(r.order_number),
    customer_id: r.customer_id ? String(r.customer_id) : null,
    guest_info: JSON.parse(String(r.guest_info_json)),
    status: r.status as OrderStatus,
    payment_status: r.payment_status as PaymentStatus,
    payment_method: (r.payment_method || "cod") as any,
    shipping_address: JSON.parse(String(r.shipping_address_json)),
    subtotal_pkr: Number(r.subtotal_pkr),
    discount_pkr: Number(r.discount_pkr || 0),
    shipping_fee_pkr: Number(r.shipping_fee_pkr || 0),
    cod_fee_pkr: Number(r.cod_fee_pkr || 0),
    fragile_packaging_fee_pkr: Number(r.fragile_packaging_fee_pkr || 0),
    total_pkr: Number(r.total_pkr),
    notes: r.notes ? String(r.notes) : undefined,
    courier_code: (r.courier_code || "tcs") as CourierCode,
    tracking_number: r.tracking_number ? String(r.tracking_number) : undefined,
    tracking_url: r.tracking_url ? String(r.tracking_url) : undefined,
    payment_proof_url: r.payment_proof_url
      ? String(r.payment_proof_url)
      : undefined,
    items,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function mapDiscountRow(r: any): DiscountCode {
  return {
    id: String(r.id),
    code: String(r.code),
    description: String(r.description),
    discount_type: r.discount_type as "percentage" | "fixed",
    discount_value: Number(r.discount_value),
    min_order_amount_pkr: Number(r.min_order_amount_pkr || 0),
    usage_limit:
      r.usage_limit !== null && r.usage_limit !== undefined
        ? Number(r.usage_limit)
        : undefined,
    times_used: Number(r.times_used || 0),
    is_active: Boolean(r.is_active),
  };
}

