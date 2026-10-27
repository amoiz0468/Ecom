-- ====================================================================
-- CROCKERY E-COMMERCE (PAKISTAN) - MIGRATION 002: RLS & INVENTORY LOCKS
-- ====================================================================

-- 1. Helper Function: Check if Authenticated User is Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Enable Row Level Security (RLS) on All Tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.collection_products enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.discount_codes enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;

-- 3. RLS Policies

-- Public Read for Catalog
create policy "Public can read published products"
  on public.products for select
  using (is_published = true or public.is_admin());

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

create policy "Public can read active variants"
  on public.product_variants for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage product variants"
  on public.product_variants for all
  using (public.is_admin());

create policy "Public can read product images"
  on public.product_images for select
  using (true);

create policy "Admins can manage product images"
  on public.product_images for all
  using (public.is_admin());

create policy "Public can read categories and collections"
  on public.categories for select using (true);
create policy "Public can read collections"
  on public.collections for select using (true);
create policy "Public can read collection_products"
  on public.collection_products for select using (true);
create policy "Public can read active shipping rates"
  on public.shipping_rates for select using (is_active = true);

-- Profiles
create policy "Users can view and edit own profile"
  on public.profiles for all
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Addresses
create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = profile_id);

-- Carts
create policy "Anyone can manage their own cart by session or auth"
  on public.carts for all
  using (
    (auth.uid() is not null and customer_id = auth.uid()) or
    session_token is not null
  );

create policy "Anyone can manage cart items"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts
      where id = cart_items.cart_id and (
        (auth.uid() is not null and customer_id = auth.uid()) or
        session_token is not null
      )
    )
  );

-- Orders
create policy "Users can view own orders"
  on public.orders for select
  using (
    (auth.uid() is not null and customer_id = auth.uid()) or
    public.is_admin()
  );

create policy "Public can insert orders (guest & user)"
  on public.orders for insert
  with check (true);

create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- Order Items
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id and (
        (auth.uid() is not null and customer_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

create policy "Public can insert order items"
  on public.order_items for insert
  with check (true);

-- Payments
create policy "Users and guests can insert payments"
  on public.payments for insert
  with check (true);

create policy "Users can view own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders
      where id = payments.order_id and (
        (auth.uid() is not null and customer_id = auth.uid()) or
        public.is_admin()
      )
    )
  );

create policy "Admins can update payments"
  on public.payments for update
  using (public.is_admin());

-- Reviews & Wishlists
create policy "Anyone can read published reviews"
  on public.reviews for select using (is_published = true);

create policy "Authenticated users can write reviews"
  on public.reviews for insert with check (auth.uid() is not null);

create policy "Authenticated users can manage wishlists"
  on public.wishlists for all using (auth.uid() = profile_id);

-- 4. Inventory Concurrency Procedures: Reserve & Restore Stock
create or replace function public.reserve_order_stock(p_order_id uuid)
returns void as $$
declare
  r record;
begin
  for r in 
    select variant_id, quantity 
    from public.order_items 
    where order_id = p_order_id
  loop
    -- Lock row and check sufficient stock
    update public.product_variants
    set stock = stock - r.quantity,
        updated_at = timezone('utc'::text, now())
    where id = r.variant_id and stock >= r.quantity;

    if not found then
      raise exception 'Stock reservation failed: Insufficient quantity for variant % in order %', r.variant_id, p_order_id;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

create or replace function public.restore_order_stock(p_order_id uuid)
returns void as $$
declare
  r record;
begin
  for r in 
    select variant_id, quantity 
    from public.order_items 
    where order_id = p_order_id
  loop
    update public.product_variants
    set stock = stock + r.quantity,
        updated_at = timezone('utc'::text, now())
    where id = r.variant_id;
  end loop;
end;
$$ language plpgsql security definer;

-- 5. Trigger: Automatically Create Profile on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Customer'),
    new.raw_user_meta_data->>'phone',
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and rebind
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
