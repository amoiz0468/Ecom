import {
  CatalogRepository,
  DiscountRepository,
  ensureCoreConfig,
} from "@/lib/db/repositories";
import { Product } from "@/types";

const CATEGORY_IMAGES: Record<string, string> = {
  "dinner-sets": "/images/catalog/dinner-set.jpg",
  bowls: "/images/catalog/bowls.jpg",
  "cups-mugs": "/images/catalog/cups-mugs.jpg",
  "plates-platters": "/images/catalog/plates-platters.jpg",
  "serving-dishes": "/images/catalog/serving-dishes.jpg",
  glassware: "/images/catalog/glassware.jpg",
  bottles: "/images/catalog/bottles.jpg",
};

function buildSeedProducts(categoryIdsBySlug: Map<string, string>): Product[] {
  const catId = (slug: string, fallback: string) =>
    categoryIdsBySlug.get(slug) || fallback;

  return [
    {
      id: "prod-royal-ivory-24pc",
      name: "Royal Ivory Gold-Rim 24pc Dinner Set",
      slug: "royal-ivory-gold-rim-24pc-dinner-set",
      description:
        "Fine bone china 24-piece dinnerware set finished with a subtle 24k gold-toned rim. Includes 6 dinner plates, 6 quarter plates, 6 soup bowls, and 6 katori bowls, packed in shock-absorbent 7-ply foam cartons.",
      category_id: catId("dinner-sets", "cat-dinner-sets"),
      material: "Bone China",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: true,
      is_fragile: true,
      is_published: true,
      rating: 4.9,
      review_count: 34,
      variants: [
        {
          id: "var-royal-ivory-24",
          product_id: "prod-royal-ivory-24pc",
          sku: "ALM-DS-2401",
          title: "24 Pieces (Service for 6)",
          price: 24500,
          compare_at_price: 28000,
          stock: 14,
          weight_grams: 6800,
          piece_count: 24,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
        {
          id: "var-royal-ivory-48",
          product_id: "prod-royal-ivory-24pc",
          sku: "ALM-DS-4801",
          title: "48 Pieces (Service for 12)",
          price: 45900,
          compare_at_price: 52000,
          stock: 6,
          weight_grams: 13200,
          piece_count: 48,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-royal-ivory-1",
          product_id: "prod-royal-ivory-24pc",
          image_url: "/images/catalog/dinner-set.jpg",
          alt_text: "Royal Ivory Gold-Rim 24pc Bone China Dinner Set",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-kashi-stoneware-bowls",
      name: "Speckled Stoneware Soup & Salad Bowls (Set of 6)",
      slug: "speckled-stoneware-soup-salad-bowls-6pc",
      description:
        "High-fired matte cream stoneware bowls with a tactile speckled glaze. Deep profile ideal for yakhni, ramen, pasta, and everyday family dining.",
      category_id: catId("bowls", "cat-bowls"),
      material: "Stoneware",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: true,
      is_fragile: true,
      is_published: true,
      rating: 4.8,
      review_count: 21,
      variants: [
        {
          id: "var-bowls-6pc",
          product_id: "prod-kashi-stoneware-bowls",
          sku: "ALM-BW-0602",
          title: "Set of 6 Bowls (600ml)",
          price: 4850,
          compare_at_price: 5600,
          stock: 28,
          weight_grams: 2400,
          piece_count: 6,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-bowls-1",
          product_id: "prod-kashi-stoneware-bowls",
          image_url: "/images/catalog/bowls.jpg",
          alt_text: "Speckled Stoneware Soup & Salad Bowls",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-artisan-chai-set",
      name: "Artisan Porcelain Chai Cup & Saucer Set (12pc)",
      slug: "artisan-porcelain-chai-cup-saucer-set-12pc",
      description:
        "Six double-glazed porcelain tea cups paired with matching saucers. Designed for comfortable grip and heat retention during evening chai gatherings.",
      category_id: catId("cups-mugs", "cat-cups-mugs"),
      material: "Porcelain",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: true,
      is_fragile: true,
      is_published: true,
      rating: 4.9,
      review_count: 19,
      variants: [
        {
          id: "var-chai-12pc",
          product_id: "prod-artisan-chai-set",
          sku: "ALM-CM-1203",
          title: "6 Cups + 6 Saucers (12pc)",
          price: 5400,
          compare_at_price: 6200,
          stock: 22,
          weight_grams: 1950,
          piece_count: 12,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-chai-1",
          product_id: "prod-artisan-chai-set",
          image_url: "/images/catalog/cups-mugs.jpg",
          alt_text: "Artisan Porcelain Chai Cup and Saucer Set",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-oval-serving-platters",
      name: "Travertine Glaze Oval Serving Platters (Set of 2)",
      slug: "travertine-glaze-oval-serving-platters-2pc",
      description:
        "Generously proportioned ceramic serving platters crafted for biryani, roast, and festive appetizers. Finished in a warm sand reactive glaze.",
      category_id: catId("plates-platters", "cat-plates-platters"),
      material: "Ceramic",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: true,
      is_fragile: true,
      is_published: true,
      rating: 4.7,
      review_count: 15,
      variants: [
        {
          id: "var-platters-2pc",
          product_id: "prod-oval-serving-platters",
          sku: "ALM-PP-0204",
          title: "Medium (12 in) + Large (14 in)",
          price: 4200,
          compare_at_price: 4900,
          stock: 18,
          weight_grams: 2100,
          piece_count: 2,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-platters-1",
          product_id: "prod-oval-serving-platters",
          image_url: "/images/catalog/plates-platters.jpg",
          alt_text: "Travertine Glaze Oval Serving Platters",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-covered-casserole-tureen",
      name: "Ivory Porcelain Covered Serving Handi (2.2L)",
      slug: "ivory-porcelain-covered-serving-handi-2-2l",
      description:
        "Elegant lidded porcelain serving tureen with twin side handles, keeping curries, nihari, and soups warm from kitchen to table.",
      category_id: catId("serving-dishes", "cat-serving-dishes"),
      material: "Porcelain",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: false,
      is_fragile: true,
      is_published: true,
      rating: 4.8,
      review_count: 11,
      variants: [
        {
          id: "var-handi-22l",
          product_id: "prod-covered-casserole-tureen",
          sku: "ALM-SD-0105",
          title: "2.2 Litre Covered Handi",
          price: 6400,
          compare_at_price: 7500,
          stock: 12,
          weight_grams: 1850,
          piece_count: 2,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-handi-1",
          product_id: "prod-covered-casserole-tureen",
          image_url: "/images/catalog/serving-dishes.jpg",
          alt_text: "Ivory Porcelain Covered Serving Handi",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-fluted-crystal-tumblers",
      name: "Fluted Crystal Water Tumblers & Carafe (7pc)",
      slug: "fluted-crystal-water-tumblers-carafe-7pc",
      description:
        "Lead-free ribbed crystal-clear glass pitcher paired with six matching fluted water tumblers for everyday hydration and guest hospitality.",
      category_id: catId("glassware", "cat-glassware"),
      material: "Opal Glass",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: false,
      is_fragile: true,
      is_published: true,
      rating: 4.9,
      review_count: 16,
      variants: [
        {
          id: "var-glass-7pc",
          product_id: "prod-fluted-crystal-tumblers",
          sku: "ALM-GW-0706",
          title: "1 Carafe + 6 Tumblers (7pc)",
          price: 4950,
          compare_at_price: 5800,
          stock: 20,
          weight_grams: 2200,
          piece_count: 7,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-glass-1",
          product_id: "prod-fluted-crystal-tumblers",
          image_url: "/images/catalog/glassware.jpg",
          alt_text: "Fluted Crystal Water Tumblers and Carafe",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-borosilicate-table-bottles",
      name: "Minimalist Ceramic & Glass Table Bottles (Set of 2)",
      slug: "minimalist-ceramic-glass-table-bottles-2pc",
      description:
        "Refillable bedside and dining table water carafes crafted in matte stoneware and borosilicate glass with snug natural stoppers.",
      category_id: catId("bottles", "cat-dinner-sets"),
      material: "Terracotta",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: false,
      is_fragile: true,
      is_published: true,
      rating: 4.6,
      review_count: 9,
      variants: [
        {
          id: "var-bottles-2pc",
          product_id: "prod-borosilicate-table-bottles",
          sku: "ALM-BT-0207",
          title: "Set of 2 (1 Litre each)",
          price: 3600,
          compare_at_price: 4200,
          stock: 25,
          weight_grams: 1400,
          piece_count: 2,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-bottles-1",
          product_id: "prod-borosilicate-table-bottles",
          image_url: "/images/catalog/bottles.jpg",
          alt_text: "Minimalist Ceramic & Glass Table Bottles",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-everyday-linen-plates",
      name: "Everyday Ivory Bone China Dinner Plates (Set of 6)",
      slug: "everyday-ivory-bone-china-dinner-plates-6pc",
      description:
        "Chip-resistant 10.5-inch dinner plates in warm ivory bone china, lightweight yet durable for daily meals and formal hosting.",
      category_id: catId("plates-platters", "cat-plates-platters"),
      material: "Bone China",
      care_instructions: { dishwasher_safe: true, microwave_safe: true, oven_safe: false, handwash_only: false },
      breakage_guarantee: "100% Free Replacement on Transit Breakage",
      is_featured: false,
      is_fragile: true,
      is_published: true,
      rating: 4.8,
      review_count: 14,
      variants: [
        {
          id: "var-plates-6pc",
          product_id: "prod-everyday-linen-plates",
          sku: "ALM-PP-0608",
          title: "6 Dinner Plates (10.5 in)",
          price: 6800,
          compare_at_price: 7800,
          stock: 16,
          weight_grams: 3100,
          piece_count: 6,
          dimensions: { length_cm: 30, width_cm: 30, height_cm: 12 },
          attributes: {},
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-plates-1",
          product_id: "prod-everyday-linen-plates",
          image_url: "/images/catalog/hero-tableware.jpg",
          alt_text: "Everyday Ivory Bone China Dinner Plates",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
  ];
}

async function main() {
  await ensureCoreConfig();

  // 1. Update category images to real generated catalog photos
  const categories = await CatalogRepository.getAllCategories();
  const categoryIdsBySlug = new Map<string, string>();

  for (const cat of categories) {
    categoryIdsBySlug.set(cat.slug, cat.id);
    const img = CATEGORY_IMAGES[cat.slug];
    if (img && cat.image_url !== img) {
      await CatalogRepository.upsertCategory({ ...cat, image_url: img }, "seed");
    }
  }
  console.log(`Updated category images for ${categories.length} categories`);

  // 2. Seed realistic products
  const products = buildSeedProducts(categoryIdsBySlug);
  for (const p of products) {
    await CatalogRepository.upsertProduct(p, "seed");
  }
  console.log(`Seeded ${products.length} crockery products with variants and images`);

  // 3. Seed sample discount codes if not already present
  const existingDiscounts = await DiscountRepository.getAll();
  if (existingDiscounts.length === 0) {
    await DiscountRepository.upsert(
      {
        id: "disc-welcome10",
        code: "WELCOME10",
        description: "10% off your first crockery order",
        discount_type: "percentage",
        discount_value: 10,
        min_order_amount_pkr: 3000,
        usage_limit: 500,
        times_used: 0,
        is_active: true,
      },
      "seed"
    );
    await DiscountRepository.upsert(
      {
        id: "disc-eid500",
        code: "ALMOIN500",
        description: "Flat Rs. 500 off orders above Rs. 8,000",
        discount_type: "fixed",
        discount_value: 500,
        min_order_amount_pkr: 8000,
        usage_limit: 200,
        times_used: 0,
        is_active: true,
      },
      "seed"
    );
    console.log("Seeded 2 sample discount codes (WELCOME10, ALMOIN500)");
  }

  console.log("Demo catalog seeding complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
