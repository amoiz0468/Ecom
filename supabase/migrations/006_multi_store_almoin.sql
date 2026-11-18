-- ====================================================================
-- ALMOIN STORE - MIGRATION 006: MULTI-STORE DEPARTMENTS
-- Supports Crockery, Ladies Boutique (Ready-to-Wear), and Ladies Shoes
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.
-- ====================================================================

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS store_type text NOT NULL DEFAULT 'crockery';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS store_type text NOT NULL DEFAULT 'crockery';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_store_type_check'
  ) THEN
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_store_type_check
      CHECK (store_type IN ('crockery', 'boutique', 'shoes'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_store_type_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_store_type_check
      CHECK (store_type IN ('crockery', 'boutique', 'shoes'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_store_type ON public.categories(store_type);
CREATE INDEX IF NOT EXISTS idx_products_store_type ON public.products(store_type);

-- Update upsert_product_tx to persist store_type
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
    id, name, slug, description, category_id, store_type, material, care_instructions,
    is_fragile, breakage_guarantee, is_featured, is_published,
    seo_title, seo_description, rating, review_count, updated_at
  )
  SELECT
    p.id, p.name, p.slug, p.description, p.category_id,
    coalesce(nullif(p.store_type, ''), 'crockery'),
    p.material, p.care_instructions,
    p.is_fragile, p.breakage_guarantee, p.is_featured, p.is_published,
    p.seo_title, p.seo_description, p.rating, p.review_count, now()
  FROM jsonb_to_record(p_product) AS p(
    id text, name text, slug text, description text, category_id text, store_type text,
    material text, care_instructions jsonb, is_fragile boolean,
    breakage_guarantee text, is_featured boolean, is_published boolean,
    seo_title text, seo_description text, rating numeric, review_count integer
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    store_type = EXCLUDED.store_type,
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

REVOKE ALL ON FUNCTION public.upsert_product_tx(jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_product_tx(jsonb, jsonb, jsonb) TO service_role;

NOTIFY pgrst, 'reload schema';

