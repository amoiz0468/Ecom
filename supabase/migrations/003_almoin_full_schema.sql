-- ====================================================================
-- ALMOIN CROCKERY (PAKISTAN) - MIGRATION 003: FULL LIVE STORE SCHEMA
-- Compatible with both text IDs (cat-1, prod-..., ord_...) and UUIDs
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  image_url text DEFAULT '/logo-card.jpg',
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  material text NOT NULL DEFAULT 'Bone China',
  care_instructions jsonb NOT NULL DEFAULT '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": false, "handwash_only": false}'::jsonb,
  is_fragile boolean NOT NULL DEFAULT true,
  breakage_guarantee text NOT NULL DEFAULT 'Protected by 100% Free Transit Breakage Replacement Guarantee (30-second unboxing video required)',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  title text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  compare_at_price integer,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight_grams integer NOT NULL DEFAULT 500,
  dimensions jsonb NOT NULL DEFAULT '{"length_cm": 30, "width_cm": 30, "height_cm": 12}'::jsonb,
  piece_count integer NOT NULL DEFAULT 1,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id text,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  customer_id text,
  guest_info jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_method text NOT NULL DEFAULT 'cod',
  shipping_address jsonb NOT NULL,
  subtotal_pkr integer NOT NULL DEFAULT 0,
  discount_pkr integer NOT NULL DEFAULT 0,
  shipping_fee_pkr integer NOT NULL DEFAULT 0,
  cod_fee_pkr integer NOT NULL DEFAULT 0,
  fragile_packaging_fee_pkr integer NOT NULL DEFAULT 0,
  total_pkr integer NOT NULL DEFAULT 0,
  notes text,
  courier_code text NOT NULL DEFAULT 'manual',
  tracking_number text,
  tracking_url text,
  payment_proof_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id text NOT NULL,
  product_title text NOT NULL,
  variant_title text NOT NULL,
  sku text NOT NULL,
  price_pkr integer NOT NULL,
  quantity integer NOT NULL,
  total_pkr integer NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.discounts (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL,
  min_order_amount_pkr integer NOT NULL DEFAULT 0,
  usage_limit integer,
  times_used integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id text PRIMARY KEY,
  zone_name text NOT NULL,
  cities jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_weight_grams integer NOT NULL DEFAULT 1000,
  base_rate_pkr integer NOT NULL DEFAULT 250,
  per_kg_extra_pkr integer NOT NULL DEFAULT 120,
  free_shipping_threshold_pkr integer NOT NULL DEFAULT 5000,
  cod_fee_pkr integer NOT NULL DEFAULT 150
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  settings_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_inquiries (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigserial PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  details text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and allow public/publishable key operations (guarded by Next.js server actions & HMAC admin auth)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

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
    EXECUTE format('CREATE POLICY "Allow app full access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

