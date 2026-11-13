-- ====================================================================
-- ALMOIN CROCKERY - MIGRATION 004: TIGHTEN ROW LEVEL SECURITY (RLS)
-- Restricts public (anon/publishable) access to published catalog reads only.
-- Orders, inquiries, discounts, settings, and audit logs require service_role.
-- ====================================================================

-- 1. Drop overly permissive policies from migration 003
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'products', 'product_variants', 'product_images',
    'orders', 'order_items', 'discounts', 'shipping_zones',
    'store_settings', 'customer_inquiries', 'audit_logs'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow app full access on %I" ON public.%I;', t, t);
  END LOOP;
END $$;

-- 2. Public Read-Only Policies for Catalog & Shipping
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Public read published products"
  ON public.products FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public read active variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Public read shipping zones"
  ON public.shipping_zones FOR SELECT
  USING (true);

-- 3. Sensitive tables (orders, order_items, discounts, store_settings, customer_inquiries, audit_logs)
-- have NO public/anon policies: only service_role (bypasses RLS) can access them.

