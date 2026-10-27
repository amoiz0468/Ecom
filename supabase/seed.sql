-- ====================================================================
-- CROCKERY E-COMMERCE (PAKISTAN) - SEED DATA (30+ REALISTIC PRODUCTS)
-- ====================================================================

-- 1. Insert Categories
insert into public.categories (id, name, slug, description, image_url, display_order)
values
  ('c1111111-1111-1111-1111-111111111111', 'Dinner Sets', 'dinner-sets', 'Complete luxury 18, 24, and 72-piece ceramic & bone china dinner sets.', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Bowls', 'bowls', 'Soup, cereal, pasta, and ramen bowls in stoneware and porcelain.', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Cups & Mugs', 'cups-mugs', 'Artisan chai cups, Kehwa sets, coffee mugs, and teacups.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Plates & Platters', 'plates-platters', 'Dinner plates, salad plates, charger plates, and serving platters.', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=1000', 4),
  ('c5555555-5555-5555-5555-555555555555', 'Serving Dishes', 'serving-dishes', 'Elegantly sculpted tureens, casserole bakers, and deep rice dishes.', 'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1000', 5),
  ('c6666666-6666-6666-6666-666666666666', 'Glassware', 'glassware', 'Fluted tumblers, amber highballs, and crystal water goblets.', 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?q=80&w=1000', 6)
on conflict (id) do nothing;

-- 2. Insert Shipping Rates
insert into public.shipping_rates (id, zone_name, cities, base_weight_grams, base_rate_pkr, per_kg_extra_pkr, free_shipping_threshold_pkr, cod_fee_pkr, is_active)
values
  ('s1111111-1111-1111-1111-111111111111', 'Karachi Metro', array['Karachi'], 1000, 200, 100, 4000, 150, true),
  ('s2222222-2222-2222-2222-222222222222', 'Major Cities', array['Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Quetta'], 1000, 280, 120, 5000, 150, true),
  ('s3333333-3333-3333-3333-333333333333', 'Rest of Pakistan', array['Other'], 1000, 350, 150, 6000, 200, true)
on conflict (id) do nothing;

-- 3. Insert Curated Crockery Products & Variants
-- Product 1: Royal Mughal Bone China Dinner Set (24-Piece)
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0101010-0101-0101-0101-010101010101',
  'Royal Mughal Bone China Dinner Set',
  'royal-mughal-bone-china-dinner-set',
  'Crafted from translucent bone china adorned with 24k gold-rim filigree inspired by Mughal floral geometry. Includes 6 dinner plates, 6 salad plates, 6 soup bowls, 2 serving platters, and 4 dessert bowls. Ideal for festive hosting and Ramadan dastarkhwans.',
  'c1111111-1111-1111-1111-111111111111',
  'Bone China',
  '{"dishwasher_safe": false, "microwave_safe": false, "oven_safe": false, "handwash_only": true}',
  true,
  true,
  true,
  'Royal Mughal Bone China 24-Piece Dinner Set | Luxury Crockery Pakistan',
  'Shop our exquisite 24k gold accented bone china dinner set in Pakistan. Fragile-safe transit guarantee with Cash on Delivery.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0101-1', 'p0101010-0101-0101-0101-010101010101', 'RMD-24PC-GOLD', 'Complete 24-Piece Dinner Set (Gold Filigree)', 28500, 32000, 15, 11500, '{"length_cm": 42, "width_cm": 38, "height_cm": 35}', 24, '{"color": "Ivory & Gold", "set_size": "24 Pieces"}'),
  ('v0101-2', 'p0101010-0101-0101-0101-010101010101', 'RMD-12PC-GOLD', 'Couple Edition 12-Piece Set', 16000, 18500, 20, 5800, '{"length_cm": 35, "width_cm": 35, "height_cm": 25}', 12, '{"color": "Ivory & Gold", "set_size": "12 Pieces"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0101010-0101-0101-0101-010101010101', null, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000', 'Royal Mughal Bone China Dinner Set Table Setting', true, 1),
  ('p0101010-0101-0101-0101-010101010101', null, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000', 'Gold rim detailing of bone china plates', false, 2);

-- Product 2: Handcrafted Multani Kashi Blue Platter
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0202020-0202-0202-0202-020202020202',
  'Multani Kashi Blue Ceramic Platter',
  'multani-kashi-blue-ceramic-platter',
  'Handmade ceramic oval serving platter in authentic cobalt blue Multani Kashi craft. Baked in high-temperature wood kilns for longevity and high glaze shine. Perfect for biryani, pulao, and kebabs.',
  'c4444444-4444-4444-4444-444444444444',
  'Ceramic',
  '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": true, "handwash_only": false}',
  true,
  true,
  true,
  'Authentic Multani Kashi Ceramic Platter | Traditional Crockery Pakistan',
  'Buy handcrafted cobalt blue Multani pottery platter with safe home delivery in Pakistan.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0202-1', 'p0202020-0202-0202-0202-020202020202', 'MKP-14IN-BLUE', '14-Inch Large Rice Platter', 3800, 4500, 35, 1400, '{"length_cm": 36, "width_cm": 26, "height_cm": 5}', 1, '{"color": "Cobalt Blue", "size": "14 inch"}'),
  ('v0202-2', 'p0202020-0202-0202-0202-020202020202', 'MKP-12IN-BLUE', '12-Inch Medium Salad Platter', 2900, 3400, 40, 1100, '{"length_cm": 30, "width_cm": 22, "height_cm": 4}', 1, '{"color": "Cobalt Blue", "size": "12 inch"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0202020-0202-0202-0202-020202020202', null, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=1000', 'Handcrafted Multani Ceramic Platter', true, 1);

-- Product 3: Artisan Stoneware Ramen & Soup Bowls (Set of 4)
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0303030-0303-0303-0303-030303030303',
  'Artisan Stoneware Ramen & Soup Bowls',
  'artisan-stoneware-ramen-soup-bowls',
  'Deep flared earthenware bowls in textured charcoal matte and speckled cream glaze. Thermal shock resistant for hot haleem, soups, and noodles. Includes built-in chopstick rests.',
  'c2222222-2222-2222-2222-222222222222',
  'Stoneware',
  '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": true, "handwash_only": false}',
  true,
  true,
  true,
  'Artisan Stoneware Soup & Ramen Bowls | Modern Crockery',
  'Stoneware soup bowls designed for durability and contemporary aesthetics in Pakistan.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0303-1', 'p0303030-0303-0303-0303-030303030303', 'ASB-4PC-CHARCOAL', 'Set of 4 - Charcoal Matte', 4200, 4800, 25, 2400, '{"length_cm": 22, "width_cm": 22, "height_cm": 18}', 4, '{"color": "Charcoal Matte", "set_size": "4 Bowls"}'),
  ('v0303-2', 'p0303030-0303-0303-0303-030303030303', 'ASB-4PC-CREAM', 'Set of 4 - Speckled Cream', 4200, 4800, 30, 2400, '{"length_cm": 22, "width_cm": 22, "height_cm": 18}', 4, '{"color": "Speckled Cream", "set_size": "4 Bowls"}'),
  ('v0303-3', 'p0303030-0303-0303-0303-030303030303', 'ASB-2PC-CHARCOAL', 'Set of 2 - Charcoal Matte', 2400, 2700, 45, 1200, '{"length_cm": 20, "width_cm": 20, "height_cm": 12}', 2, '{"color": "Charcoal Matte", "set_size": "2 Bowls"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0303030-0303-0303-0303-030303030303', null, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000', 'Artisan Stoneware Bowls Set', true, 1);

-- Product 4: Peshawari Qehwa & Chai Cups Set (6 Cups + Kettle)
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0404040-0404-0404-0404-040404040404',
  'Peshawari Qehwa Ceramic Tea Set',
  'peshawari-qehwa-ceramic-tea-set',
  'Traditional handcrafted green tea set featuring 6 handleless flared earthenware cups and a matching 800ml teapot with stainless infuser. Finished in rustic sage green glaze.',
  'c3333333-3333-3333-3333-333333333333',
  'Ceramic',
  '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": false, "handwash_only": false}',
  true,
  true,
  true,
  'Peshawari Qehwa Set with Teapot | Crockery Online Pakistan',
  'Authentic ceramic Peshawari Qehwa tea set with teapot. Fast shipping across Pakistan with Cash on Delivery.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0404-1', 'p0404040-0404-0404-0404-040404040404', 'PQS-7PC-SAGE', 'Complete Set (1 Teapot + 6 Cups) - Sage Green', 4950, 5800, 22, 2100, '{"length_cm": 28, "width_cm": 25, "height_cm": 20}', 7, '{"color": "Sage Green", "set_size": "7 Pieces"}'),
  ('v0404-2', 'p0404040-0404-0404-0404-040404040404', 'PQS-6CUPS-SAGE', '6 Cups Only (Without Teapot)', 2800, 3300, 35, 900, '{"length_cm": 20, "width_cm": 15, "height_cm": 10}', 6, '{"color": "Sage Green", "set_size": "6 Cups"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0404040-0404-0404-0404-040404040404', null, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000', 'Peshawari Ceramic Tea Set', true, 1);

-- Product 5: Minimalist Matte Black Dinner Plates (Set of 6)
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0505050-0505-0505-0505-050505050505',
  'Nordic Matte Black Coupe Dinner Plates',
  'nordic-matte-black-coupe-dinner-plates',
  'Sleek 10.5-inch coupe rim plates designed for contemporary table presentation. High-fired porcelain with scratch-resistant matte glaze.',
  'c4444444-4444-4444-4444-444444444444',
  'Porcelain',
  '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": true, "handwash_only": false}',
  true,
  true,
  true,
  'Matte Black Ceramic Coupe Dinner Plates Set of 6',
  'Luxury matte black dinner plates. Premium scratch resistant finish with COD in Pakistan.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0505-1', 'p0505050-0505-0505-0505-050505050505', 'NMB-6PC-10IN', 'Set of 6 Plates (10.5 Inch)', 5600, 6500, 40, 3600, '{"length_cm": 30, "width_cm": 30, "height_cm": 15}', 6, '{"color": "Matte Black", "size": "10.5 inch"}'),
  ('v0505-2', 'p0505050-0505-0505-0505-050505050505', 'NMB-SINGLE-10IN', 'Single Piece (10.5 Inch)', 1100, 1300, 80, 600, '{"length_cm": 28, "width_cm": 28, "height_cm": 3}', 1, '{"color": "Matte Black", "size": "10.5 inch"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0505050-0505-0505-0505-050505050505', null, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=1000', 'Matte Black Coupe Dinner Plates', true, 1);

-- Product 6: Elegant Porcelain Covered Tureen with Ladle
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0606060-0606-0606-0606-060606060606',
  'Porcelain Soup & Curry Tureen with Lid',
  'porcelain-soup-curry-tureen-with-lid',
  'An opulent centerpiece serving tureen with fitted domed lid and matching porcelain ladle. 2.8 Litre capacity keeps curries, nihari, and soups piping hot throughout dinners.',
  'c5555555-5555-5555-5555-555555555555',
  'Porcelain',
  '{"dishwasher_safe": true, "microwave_safe": true, "oven_safe": true, "handwash_only": false}',
  true,
  true,
  true,
  'White Porcelain Soup & Curry Tureen with Lid | Serving Crockery',
  'Luxury 2.8L porcelain soup tureen with matching serving ladle for dinners and events.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0606-1', 'p0606060-0606-0606-0606-060606060606', 'PCT-2800ML-WHITE', '2.8 Litre Tureen + Lid + Ladle', 6800, 7900, 18, 2800, '{"length_cm": 32, "width_cm": 28, "height_cm": 22}', 3, '{"color": "Pearl White", "capacity": "2.8 Litres"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0606060-0606-0606-0606-060606060606', null, 'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1000', 'Porcelain Tureen with Lid', true, 1);

-- Product 7: Vintage Ribbed Amber Glass Tumblers (Set of 6)
insert into public.products (id, name, slug, description, category_id, material, care_instructions, is_fragile, is_featured, is_published, seo_title, seo_description)
values (
  'p0707070-0707-0707-0707-070707070707',
  'Vintage Ribbed Amber Highball Tumblers',
  'vintage-ribbed-amber-highball-tumblers',
  'Hand-blown optical fluted glassware in warm amber glow. Weighted base for high stability and tactile ribbed grip. 380ml capacity.',
  'c6666666-6666-6666-6666-666666666666',
  'Opal Glass',
  '{"dishwasher_safe": true, "microwave_safe": false, "oven_safe": false, "handwash_only": false}',
  true,
  true,
  true,
  'Vintage Ribbed Amber Glass Tumblers Set of 6 | Pakistan Glassware',
  'Shop modern ribbed amber drinking glasses set of 6 in Pakistan.'
) on conflict (id) do nothing;

insert into public.product_variants (id, product_id, sku, title, price, compare_at_price, stock, weight_grams, dimensions, piece_count, attributes)
values 
  ('v0707-1', 'p0707070-0707-0707-0707-070707070707', 'VRA-6PC-380ML', 'Set of 6 Tumblers (380ml)', 3600, 4200, 50, 1800, '{"length_cm": 24, "width_cm": 16, "height_cm": 15}', 6, '{"color": "Amber Gold", "capacity": "380 ml"}'),
  ('v0707-2', 'p0707070-0707-0707-0707-070707070707', 'VRA-2PC-380ML', 'Set of 2 Tumblers (380ml)', 1400, 1600, 60, 600, '{"length_cm": 16, "width_cm": 10, "height_cm": 15}', 2, '{"color": "Amber Gold", "capacity": "380 ml"}')
on conflict (id) do nothing;

insert into public.product_images (product_id, variant_id, image_url, alt_text, is_primary, display_order)
values
  ('p0707070-0707-0707-0707-070707070707', null, 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?q=80&w=1000', 'Amber Ribbed Tumblers', true, 1);
