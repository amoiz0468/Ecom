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
  "ready-to-wear-suits": "/images/catalog/boutique-suits.jpg",
  "festive-pret": "/images/catalog/boutique-festive.jpg",
  "heels-sandals": "/images/catalog/shoes-heels.jpg",
  "khussas-flats": "/images/catalog/shoes-khussa.jpg",
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
    {
      id: "prod-ivory-embroidered-3pc-suit",
      name: "Ivory Gold-Embroidered 3pc Ready-to-Wear Suit",
      slug: "ivory-gold-embroidered-3pc-rtw-suit",
      description:
        "Tailored three-piece ready-to-wear pret suit in breathable Swiss lawn with delicate gold threadwork on neckline, organza dupatta, and straight-cut trousers.",
      category_id: catId("ready-to-wear-suits", "cat-rtw-suits"),
      store_type: "boutique",
      material: "Lawn",
      care_instructions: {
        dishwasher_safe: false,
        microwave_safe: false,
        oven_safe: false,
        handwash_only: true,
      },
      is_fragile: false,
      breakage_guarantee: "7-Day Easy Size Exchange & Quality Guarantee",
      is_featured: true,
      is_published: true,
      rating: 4.9,
      review_count: 27,
      variants: [
        {
          id: "var-suit-ivory-s",
          product_id: "prod-ivory-embroidered-3pc-suit",
          sku: "ALM-BTQ-101-S",
          title: "S",
          price: 8950,
          compare_at_price: 10500,
          stock: 10,
          weight_grams: 750,
          piece_count: 3,
          dimensions: { length_cm: 35, width_cm: 28, height_cm: 6 },
          attributes: { size: "S" },
          is_active: true,
        },
        {
          id: "var-suit-ivory-m",
          product_id: "prod-ivory-embroidered-3pc-suit",
          sku: "ALM-BTQ-101-M",
          title: "M",
          price: 8950,
          compare_at_price: 10500,
          stock: 15,
          weight_grams: 750,
          piece_count: 3,
          dimensions: { length_cm: 35, width_cm: 28, height_cm: 6 },
          attributes: { size: "M" },
          is_active: true,
        },
        {
          id: "var-suit-ivory-l",
          product_id: "prod-ivory-embroidered-3pc-suit",
          sku: "ALM-BTQ-101-L",
          title: "L",
          price: 8950,
          compare_at_price: 10500,
          stock: 12,
          weight_grams: 750,
          piece_count: 3,
          dimensions: { length_cm: 35, width_cm: 28, height_cm: 6 },
          attributes: { size: "L" },
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-suit-ivory-1",
          product_id: "prod-ivory-embroidered-3pc-suit",
          image_url: "/images/catalog/boutique-suits.jpg",
          alt_text: "Ivory Gold-Embroidered 3pc Ready-to-Wear Suit",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-sage-chiffon-festive-pret",
      name: "Pastel Sage Embroidered Chiffon Festive Pret",
      slug: "pastel-sage-embroidered-chiffon-festive-pret",
      description:
        "Two-piece formal stitched chiffon kurta with scalloped embroidered dupatta in muted sage and champagne gold—ready for dawat and festive evenings.",
      category_id: catId("festive-pret", "cat-festive-pret"),
      store_type: "boutique",
      material: "Chiffon",
      care_instructions: {
        dishwasher_safe: false,
        microwave_safe: false,
        oven_safe: false,
        handwash_only: true,
      },
      is_fragile: false,
      breakage_guarantee: "7-Day Easy Size Exchange & Quality Guarantee",
      is_featured: true,
      is_published: true,
      rating: 4.8,
      review_count: 18,
      variants: [
        {
          id: "var-festive-s",
          product_id: "prod-sage-chiffon-festive-pret",
          sku: "ALM-BTQ-102-S",
          title: "S",
          price: 11800,
          compare_at_price: 13500,
          stock: 8,
          weight_grams: 800,
          piece_count: 2,
          dimensions: { length_cm: 35, width_cm: 28, height_cm: 6 },
          attributes: { size: "S" },
          is_active: true,
        },
        {
          id: "var-festive-m",
          product_id: "prod-sage-chiffon-festive-pret",
          sku: "ALM-BTQ-102-M",
          title: "M",
          price: 11800,
          compare_at_price: 13500,
          stock: 11,
          weight_grams: 800,
          piece_count: 2,
          dimensions: { length_cm: 35, width_cm: 28, height_cm: 6 },
          attributes: { size: "M" },
          is_active: true,
        },
        {
          id: "var-festive-l",
          product_id: "prod-sage-chiffon-festive-pret",
          sku: "ALM-BTQ-102-L",
          title: "L",
          price: 11800,
          compare_at_price: 13500,
          stock: 9,
          weight_grams: 800,
          piece_count: 2,
          dimensions: { length_cm: 35, width_cm: 28, height_cm: 6 },
          attributes: { size: "L" },
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-festive-1",
          product_id: "prod-sage-chiffon-festive-pret",
          image_url: "/images/catalog/boutique-festive.jpg",
          alt_text: "Pastel Sage Embroidered Chiffon Festive Pret",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-champagne-block-heel-sandals",
      name: "Champagne Leather Block-Heel Sandals",
      slug: "champagne-leather-block-heel-sandals",
      description:
        "Cushioned insole ladies block heels crafted in soft champagne leather with a balanced 2.5-inch heel for all-day wedding and formal comfort.",
      category_id: catId("heels-sandals", "cat-heels-sandals"),
      store_type: "shoes",
      material: "Genuine Leather",
      care_instructions: {
        dishwasher_safe: false,
        microwave_safe: false,
        oven_safe: false,
        handwash_only: true,
      },
      is_fragile: false,
      breakage_guarantee: "7-Day Easy Size Exchange & Quality Guarantee",
      is_featured: true,
      is_published: true,
      rating: 4.9,
      review_count: 22,
      variants: [
        {
          id: "var-heels-37",
          product_id: "prod-champagne-block-heel-sandals",
          sku: "ALM-SHO-201-37",
          title: "EU 37",
          price: 5800,
          compare_at_price: 6800,
          stock: 9,
          weight_grams: 850,
          piece_count: 1,
          dimensions: { length_cm: 30, width_cm: 20, height_cm: 12 },
          attributes: { size: "37" },
          is_active: true,
        },
        {
          id: "var-heels-38",
          product_id: "prod-champagne-block-heel-sandals",
          sku: "ALM-SHO-201-38",
          title: "EU 38",
          price: 5800,
          compare_at_price: 6800,
          stock: 14,
          weight_grams: 850,
          piece_count: 1,
          dimensions: { length_cm: 30, width_cm: 20, height_cm: 12 },
          attributes: { size: "38" },
          is_active: true,
        },
        {
          id: "var-heels-39",
          product_id: "prod-champagne-block-heel-sandals",
          sku: "ALM-SHO-201-39",
          title: "EU 39",
          price: 5800,
          compare_at_price: 6800,
          stock: 12,
          weight_grams: 850,
          piece_count: 1,
          dimensions: { length_cm: 30, width_cm: 20, height_cm: 12 },
          attributes: { size: "39" },
          is_active: true,
        },
        {
          id: "var-heels-40",
          product_id: "prod-champagne-block-heel-sandals",
          sku: "ALM-SHO-201-40",
          title: "EU 40",
          price: 5800,
          compare_at_price: 6800,
          stock: 7,
          weight_grams: 850,
          piece_count: 1,
          dimensions: { length_cm: 30, width_cm: 20, height_cm: 12 },
          attributes: { size: "40" },
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-heels-1",
          product_id: "prod-champagne-block-heel-sandals",
          image_url: "/images/catalog/shoes-heels.jpg",
          alt_text: "Champagne Leather Block-Heel Sandals",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
    {
      id: "prod-ivory-tilla-khussa",
      name: "Handcrafted Ivory & Gold Tilla Khussas",
      slug: "handcrafted-ivory-gold-tilla-khussas",
      description:
        "Artisanal double-cushioned ladies khussas hand-embroidered with antique gold tilla and dabka accents, lined with soft breathable leather.",
      category_id: catId("khussas-flats", "cat-khussas-flats"),
      store_type: "shoes",
      material: "Embroidered Silk",
      care_instructions: {
        dishwasher_safe: false,
        microwave_safe: false,
        oven_safe: false,
        handwash_only: true,
      },
      is_fragile: false,
      breakage_guarantee: "7-Day Easy Size Exchange & Quality Guarantee",
      is_featured: false,
      is_published: true,
      rating: 4.8,
      review_count: 19,
      variants: [
        {
          id: "var-khussa-37",
          product_id: "prod-ivory-tilla-khussa",
          sku: "ALM-SHO-202-37",
          title: "EU 37",
          price: 4200,
          compare_at_price: 4900,
          stock: 11,
          weight_grams: 650,
          piece_count: 1,
          dimensions: { length_cm: 28, width_cm: 18, height_cm: 10 },
          attributes: { size: "37" },
          is_active: true,
        },
        {
          id: "var-khussa-38",
          product_id: "prod-ivory-tilla-khussa",
          sku: "ALM-SHO-202-38",
          title: "EU 38",
          price: 4200,
          compare_at_price: 4900,
          stock: 16,
          weight_grams: 650,
          piece_count: 1,
          dimensions: { length_cm: 28, width_cm: 18, height_cm: 10 },
          attributes: { size: "38" },
          is_active: true,
        },
        {
          id: "var-khussa-39",
          product_id: "prod-ivory-tilla-khussa",
          sku: "ALM-SHO-202-39",
          title: "EU 39",
          price: 4200,
          compare_at_price: 4900,
          stock: 13,
          weight_grams: 650,
          piece_count: 1,
          dimensions: { length_cm: 28, width_cm: 18, height_cm: 10 },
          attributes: { size: "39" },
          is_active: true,
        },
      ],
      images: [
        {
          id: "img-khussa-1",
          product_id: "prod-ivory-tilla-khussa",
          image_url: "/images/catalog/shoes-khussa.jpg",
          alt_text: "Handcrafted Ivory & Gold Tilla Khussas",
          is_primary: true,
          display_order: 1,
        },
      ],
    },
  ];
}

async function main() {
  await ensureCoreConfig();

  // 1. Ensure all 3-store categories exist & update their images
  const { DEFAULT_CATEGORIES } = await import("@/lib/data/constants");
  const existingCategories = await CatalogRepository.getAllCategories();
  const existingSlugs = new Set(existingCategories.map((c) => c.slug));
  for (const def of DEFAULT_CATEGORIES) {
    if (!existingSlugs.has(def.slug)) {
      await CatalogRepository.upsertCategory(def, "seed");
    }
  }

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
