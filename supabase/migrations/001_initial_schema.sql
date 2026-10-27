-- ====================================================================
-- CROCKERY E-COMMERCE (PAKISTAN) - DATABASE SCHEMA MIGRATION 001
-- ====================================================================

-- 1. Custom Types & Enums
create type public.user_role as enum ('customer', 'admin', 'support');

create type public.order_status as enum (
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
);

create type public.payment_status as enum (
  'unpaid',
  'awaiting_verification',
  'paid',
  'refunded'
);

create type public.payment_provider as enum (
  'cod',
  'manual_transfer',
  'safepay',
  'payfast'
);

create type public.courier_code as enum (
  'manual',
  'tcs',
  'leopards',
  'postex',
  'trax'
);

-- 2. User Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role public.user_role default 'customer'::public.user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Categories Table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  display_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Collections Table
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  banner_image_url text,
  is_featured boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Products Table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  category_id uuid references public.categories(id) on delete restrict not null,
  material text not null, -- Ceramic, Bone China, Porcelain, Stoneware, Opal Glass, Terracotta
  care_instructions jsonb default '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": false, "handwash_only": false}'::jsonb not null,
  is_fragile boolean default true not null,
  breakage_guarantee text default 'Protected by 100% Free Transit Breakage Replacement Guarantee (30-second unboxing video required)' not null,
  is_featured boolean default false not null,
  is_published boolean default true not null,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Product Variants Table (Prices stored in integer PKR)
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  sku text not null unique,
  title text not null, -- e.g. "Emerald Rim - Set of 6"
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  stock integer default 0 not null check (stock >= 0),
  weight_grams integer default 500 not null,
  dimensions jsonb default '{"length_cm": 20, "width_cm": 20, "height_cm": 5}'::jsonb not null,
  piece_count integer default 1 not null,
  attributes jsonb default '{}'::jsonb not null, -- { "color": "Emerald", "size": "10.5 inch", "type": "Set" }
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Product Images Table
create table if not exists public.product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete set null,
  image_url text not null,
  alt_text text not null,
  is_primary boolean default false not null,
  display_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Collection Products Mapping
create table if not exists public.collection_products (
  collection_id uuid references public.collections(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  display_order integer default 0 not null,
  primary key (collection_id, product_id)
);

-- 9. Customer Addresses Table
create table if not exists public.addresses (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  recipient_name text not null,
  phone text not null,
  alternate_phone text,
  street_address text not null,
  landmark text,
  city text not null,
  province text not null,
  postal_code text,
  is_default boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Carts & Cart Items Table (Guest and Authenticated)
create table if not exists public.carts (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade,
  session_token text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  cart_id uuid references public.carts(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete cascade not null,
  quantity integer default 1 not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (cart_id, variant_id)
);

-- 11. Discount Codes Table
create table if not exists public.discount_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  description text,
  discount_type text check (discount_type in ('percentage', 'fixed')) not null,
  discount_value integer not null check (discount_value > 0),
  min_order_amount_pkr integer default 0 not null,
  max_discount_pkr integer,
  usage_limit integer,
  times_used integer default 0 not null,
  expires_at timestamp with time zone,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Shipping Rates Table
create table if not exists public.shipping_rates (
  id uuid default gen_random_uuid() primary key,
  zone_name text not null, -- e.g. "Karachi Metro", "Major Cities (Lahore/Islamabad/Rawalpindi)", "Rest of Pakistan"
  cities text[] default '{}'::text[] not null,
  base_weight_grams integer default 1000 not null, -- 1kg base
  base_rate_pkr integer default 250 not null,
  per_kg_extra_pkr integer default 120 not null,
  free_shipping_threshold_pkr integer default 5000,
  cod_fee_pkr integer default 150 not null,
  is_active boolean default true not null
);

-- 13. Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique, -- e.g. "PK-CROCK-10492"
  customer_id uuid references public.profiles(id) on delete set null,
  guest_info jsonb not null, -- { "name": "...", "email": "...", "phone": "..." }
  status public.order_status default 'pending'::public.order_status not null,
  payment_status public.payment_status default 'unpaid'::public.payment_status not null,
  shipping_address jsonb not null,
  subtotal_pkr integer not null check (subtotal_pkr >= 0),
  discount_pkr integer default 0 not null check (discount_pkr >= 0),
  shipping_fee_pkr integer default 0 not null check (shipping_fee_pkr >= 0),
  cod_fee_pkr integer default 0 not null check (cod_fee_pkr >= 0),
  fragile_packaging_fee_pkr integer default 0 not null check (fragile_packaging_fee_pkr >= 0),
  total_pkr integer not null check (total_pkr >= 0),
  notes text,
  courier_code public.courier_code default 'manual'::public.courier_code not null,
  tracking_number text,
  tracking_url text,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Order Items Table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_title text not null,
  variant_title text not null,
  sku text not null,
  price_pkr integer not null check (price_pkr >= 0),
  quantity integer not null check (quantity > 0),
  total_pkr integer not null check (total_pkr >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Payments Table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  provider public.payment_provider not null,
  method text not null, -- 'cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'safepay_card'
  amount_pkr integer not null check (amount_pkr >= 0),
  status text check (status in ('pending', 'awaiting_review', 'completed', 'failed', 'refunded')) default 'pending' not null,
  transaction_reference text,
  proof_image_url text,
  raw_webhook_payload jsonb,
  admin_reviewed_by uuid references public.profiles(id) on delete set null,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Wishlists Table
create table if not exists public.wishlists (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (profile_id, product_id)
);

-- 17. Reviews Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text not null,
  is_verified_buyer boolean default false not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. Full-Text Search Index for Crockery Catalog
create index if not exists idx_products_fts on public.products using gin (
  to_tsvector('english', name || ' ' || description || ' ' || material)
);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_product_variants_sku on public.product_variants(sku);
create index if not exists idx_orders_order_number on public.orders(order_number);
