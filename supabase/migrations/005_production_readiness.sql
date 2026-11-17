-- ====================================================================
-- ALMOIN CROCKERY - MIGRATION 005: PRODUCTION READINESS
-- Makes Supabase Postgres the single source of truth (replaces SQLite).
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.
-- ====================================================================

-- 1. Admin users (only reachable with the server-side service_role key)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: anon/authenticated can never read this table.

-- 2. Audit logs: keep client IP
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address text;

-- 3. Indexes for the queries the storefront and admin run
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published, is_featured);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.customer_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discounts_code_upper ON public.discounts(upper(code));

-- 4. Atomic order creation: stock check + decrement + coupon usage + order + items
CREATE OR REPLACE FUNCTION public.create_order_tx(
  p_order jsonb,
  p_items jsonb,
  p_coupon text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  it jsonb;
  v_stock integer;
  v_qty integer;
  v_rows integer;
BEGIN
  FOR it IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (it->>'quantity')::integer;

    -- Row lock so two simultaneous buyers cannot oversell the last unit
    SELECT stock INTO v_stock
      FROM public.product_variants
      WHERE id = it->>'variant_id'
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant % is no longer available.', it->>'variant_id';
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "% (%)". Only % left.',
        it->>'product_title', it->>'variant_title', v_stock;
    END IF;

    UPDATE public.product_variants
      SET stock = stock - v_qty, updated_at = now()
      WHERE id = it->>'variant_id';
  END LOOP;

  IF p_coupon IS NOT NULL AND length(trim(p_coupon)) > 0 THEN
    UPDATE public.discounts
      SET times_used = times_used + 1
      WHERE upper(code) = upper(trim(p_coupon))
        AND is_active
        AND (usage_limit IS NULL OR times_used < usage_limit);
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN
      RAISE EXCEPTION 'Coupon % has reached its usage limit.', upper(trim(p_coupon));
    END IF;
  END IF;

  INSERT INTO public.orders (
    id, order_number, customer_id, guest_info, status, payment_status,
    payment_method, shipping_address, subtotal_pkr, discount_pkr,
    shipping_fee_pkr, cod_fee_pkr, fragile_packaging_fee_pkr, total_pkr,
    notes, courier_code, tracking_number, tracking_url, payment_proof_url,
    created_at, updated_at
  )
  SELECT
    o.id, o.order_number, o.customer_id, o.guest_info, o.status, o.payment_status,
    o.payment_method, o.shipping_address, o.subtotal_pkr, o.discount_pkr,
    o.shipping_fee_pkr, o.cod_fee_pkr, o.fragile_packaging_fee_pkr, o.total_pkr,
    o.notes, o.courier_code, o.tracking_number, o.tracking_url, o.payment_proof_url,
    o.created_at, o.updated_at
  FROM jsonb_to_record(p_order) AS o(
    id text, order_number text, customer_id text, guest_info jsonb, status text,
    payment_status text, payment_method text, shipping_address jsonb,
    subtotal_pkr integer, discount_pkr integer, shipping_fee_pkr integer,
    cod_fee_pkr integer, fragile_packaging_fee_pkr integer, total_pkr integer,
    notes text, courier_code text, tracking_number text, tracking_url text,
    payment_proof_url text, created_at timestamptz, updated_at timestamptz
  );

  INSERT INTO public.order_items (
    id, order_id, variant_id, product_title, variant_title, sku,
    price_pkr, quantity, total_pkr, image_url
  )
  SELECT
    i.id, i.order_id, i.variant_id, i.product_title, i.variant_title, i.sku,
    i.price_pkr, i.quantity, i.total_pkr, i.image_url
  FROM jsonb_to_recordset(p_items) AS i(
    id text, order_id text, variant_id text, product_title text,
    variant_title text, sku text, price_pkr integer, quantity integer,
    total_pkr integer, image_url text
  );
END;
$$;

-- 5. Atomic status change (restores stock when an order becomes cancelled)
CREATE OR REPLACE FUNCTION public.update_order_status_tx(
  p_order_id text,
  p_status text,
  p_payment_status text,
  p_tracking_number text,
  p_courier_code text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_old_status text;
BEGIN
  SELECT status INTO v_old_status FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF p_status = 'cancelled' AND v_old_status <> 'cancelled' THEN
    UPDATE public.product_variants v
      SET stock = v.stock + oi.quantity, updated_at = now()
      FROM public.order_items oi
      WHERE oi.order_id = p_order_id AND oi.variant_id = v.id;
  END IF;

  UPDATE public.orders
    SET status = p_status,
        payment_status = p_payment_status,
        tracking_number = p_tracking_number,
        courier_code = p_courier_code,
        updated_at = now()
    WHERE id = p_order_id;

  RETURN true;
END;
$$;

-- 6. Atomic delete (restores stock unless the order was already cancelled)
CREATE OR REPLACE FUNCTION public.delete_order_tx(p_order_id text) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_status <> 'cancelled' THEN
    UPDATE public.product_variants v
      SET stock = v.stock + oi.quantity, updated_at = now()
      FROM public.order_items oi
      WHERE oi.order_id = p_order_id AND oi.variant_id = v.id;
  END IF;

  DELETE FROM public.orders WHERE id = p_order_id;
  RETURN true;
END;
$$;

-- 7. Atomic product save (product + variants + images in one transaction)
CREATE OR REPLACE FUNCTION public.upsert_product_tx(
  p_product jsonb,
  p_variants jsonb,
  p_images jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_id text := p_product->>'id';
BEGIN
  INSERT INTO public.products (
    id, name, slug, description, category_id, material, care_instructions,
    is_fragile, breakage_guarantee, is_featured, is_published,
    seo_title, seo_description, rating, review_count, updated_at
  )
  SELECT
    p.id, p.name, p.slug, p.description, p.category_id, p.material, p.care_instructions,
    p.is_fragile, p.breakage_guarantee, p.is_featured, p.is_published,
    p.seo_title, p.seo_description, p.rating, p.review_count, now()
  FROM jsonb_to_record(p_product) AS p(
    id text, name text, slug text, description text, category_id text,
    material text, care_instructions jsonb, is_fragile boolean,
    breakage_guarantee text, is_featured boolean, is_published boolean,
    seo_title text, seo_description text, rating numeric, review_count integer
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    material = EXCLUDED.material,
    care_instructions = EXCLUDED.care_instructions,
    is_fragile = EXCLUDED.is_fragile,
    breakage_guarantee = EXCLUDED.breakage_guarantee,
    is_featured = EXCLUDED.is_featured,
    is_published = EXCLUDED.is_published,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    updated_at = now();

  DELETE FROM public.product_variants WHERE product_id = v_id;
  INSERT INTO public.product_variants (
    id, product_id, sku, title, price, compare_at_price, stock,
    weight_grams, dimensions, piece_count, attributes, is_active
  )
  SELECT
    v.id, v_id, v.sku, v.title, v.price, v.compare_at_price, v.stock,
    v.weight_grams, v.dimensions, v.piece_count, v.attributes, v.is_active
  FROM jsonb_to_recordset(p_variants) AS v(
    id text, sku text, title text, price integer, compare_at_price integer,
    stock integer, weight_grams integer, dimensions jsonb, piece_count integer,
    attributes jsonb, is_active boolean
  );

  DELETE FROM public.product_images WHERE product_id = v_id;
  INSERT INTO public.product_images (
    id, product_id, variant_id, image_url, alt_text, is_primary, display_order
  )
  SELECT
    i.id, v_id, i.variant_id, i.image_url, i.alt_text, i.is_primary, i.display_order
  FROM jsonb_to_recordset(p_images) AS i(
    id text, variant_id text, image_url text, alt_text text,
    is_primary boolean, display_order integer
  );
END;
$$;

-- 8. Dashboard aggregates in one round trip
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics() RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'orderSummary', (
      SELECT jsonb_build_object(
        'total_orders', count(*),
        'total_revenue_pkr', coalesce(sum(CASE WHEN status <> 'cancelled' THEN total_pkr ELSE 0 END), 0),
        'pending_orders', coalesce(sum(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0),
        'fulfilled_orders', coalesce(sum(CASE WHEN status IN ('shipped', 'delivered') THEN 1 ELSE 0 END), 0)
      ) FROM public.orders
    ),
    'inventorySummary', (
      SELECT jsonb_build_object(
        'total_products', count(DISTINCT p.id),
        'total_skus', count(v.id),
        'total_units_in_stock', coalesce(sum(v.stock), 0),
        'low_stock_skus', coalesce(sum(CASE WHEN v.stock <= 5 THEN 1 ELSE 0 END), 0)
      ) FROM public.products p LEFT JOIN public.product_variants v ON v.product_id = p.id
    ),
    'paymentBreakdown', coalesce((
      SELECT jsonb_agg(t) FROM (
        SELECT payment_method, count(*) AS order_count, coalesce(sum(total_pkr), 0) AS revenue_pkr
        FROM public.orders WHERE status <> 'cancelled' GROUP BY payment_method
      ) t
    ), '[]'::jsonb),
    'topSellingSkus', coalesce((
      SELECT jsonb_agg(t) FROM (
        SELECT sku, product_title, variant_title,
               sum(quantity) AS units_sold, sum(total_pkr) AS revenue_pkr
        FROM public.order_items
        GROUP BY sku, product_title, variant_title
        ORDER BY sum(total_pkr) DESC
        LIMIT 5
      ) t
    ), '[]'::jsonb)
  );
$$;

-- 9. These functions are for the server only. Postgres grants EXECUTE to PUBLIC
--    by default, which would expose them to the anon key through /rest/v1/rpc.
REVOKE ALL ON FUNCTION public.create_order_tx(jsonb, jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_order_status_tx(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_order_tx(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.upsert_product_tx(jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_dashboard_metrics() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_order_tx(jsonb, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_status_tx(text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_order_tx(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_product_tx(jsonb, jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics() TO service_role;

-- 10. Make PostgREST pick up the new functions immediately
NOTIFY pgrst, 'reload schema';

