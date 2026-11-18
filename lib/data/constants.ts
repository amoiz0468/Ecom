import { Category, ShippingZone, StoreDepartment } from "@/types";

export interface StoreDepartmentMeta {
  id: StoreDepartment;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  href: string;
  image: string;
  materials: string[];
  variantPresets: string[];
}

export const STORE_DEPARTMENTS: StoreDepartmentMeta[] = [
  {
    id: "crockery",
    name: "Almoin Crockery",
    shortName: "Crockery",
    tagline: "Fine Bone China & Tableware",
    description:
      "Royal bone china dinner sets, handcrafted stoneware bowls, and serving platters with 100% Transit Breakage Guarantee.",
    href: "/shop?store=crockery",
    image: "/images/catalog/dinner-set.jpg",
    materials: [
      "Bone China",
      "Ceramic",
      "Porcelain",
      "Stoneware",
      "Terracotta",
      "Opal Glass",
    ],
    variantPresets: ["24 Pieces", "48 Pieces", "Set of 6", "Standard"],
  },
  {
    id: "boutique",
    name: "Almoin Boutique",
    shortName: "Ladies Boutique",
    tagline: "Ladies Ready-to-Wear Suits",
    description:
      "Curated embroidered lawn, chiffon, silk, and festive 3-piece ready-to-wear pret suits tailored for effortless elegance.",
    href: "/shop?store=boutique",
    image: "/images/catalog/boutique-suits.jpg",
    materials: ["Lawn", "Chiffon", "Raw Silk", "Organza", "Cotton", "Velvet"],
    variantPresets: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "shoes",
    name: "Almoin Shoes",
    shortName: "Ladies Shoes",
    tagline: "Heels, Khussas & Flats",
    description:
      "Handcrafted tilla khussas, cushioned block heels, and everyday flats built for comfort and festive occasions.",
    href: "/shop?store=shoes",
    image: "/images/catalog/shoes-heels.jpg",
    materials: [
      "Genuine Leather",
      "Faux Leather",
      "Suede",
      "Velvet",
      "Embroidered Silk",
      "Patent",
    ],
    variantPresets: ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41"],
  },
];

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Abbottabad",
  "Mardan",
  "Rahim Yar Khan",
  "Jhelum",
  "Gujrat",
  "Sahiwal",
  "Mirpur (AJK)",
  "Muzaffarabad",
];

export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "zone-karachi",
    zone_name: "Karachi Metro (Same City)",
    cities: ["Karachi"],
    base_weight_grams: 1000,
    base_rate_pkr: 200,
    per_kg_extra_pkr: 80,
    free_shipping_threshold_pkr: 5000,
    cod_fee_pkr: 150,
  },
  {
    id: "zone-major",
    zone_name: "Major Cities (Lahore, Islamabad, Rawalpindi, Faisalabad, Multan)",
    cities: [
      "Lahore",
      "Islamabad",
      "Rawalpindi",
      "Faisalabad",
      "Multan",
      "Hyderabad",
      "Sialkot",
      "Gujranwala",
      "Peshawar",
    ],
    base_weight_grams: 1000,
    base_rate_pkr: 280,
    per_kg_extra_pkr: 120,
    free_shipping_threshold_pkr: 5000,
    cod_fee_pkr: 150,
  },
  {
    id: "zone-rest",
    zone_name: "Rest of Pakistan",
    cities: [],
    base_weight_grams: 1000,
    base_rate_pkr: 350,
    per_kg_extra_pkr: 150,
    free_shipping_threshold_pkr: 5000,
    cod_fee_pkr: 150,
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-dinner-sets",
    name: "Dinner Sets",
    slug: "dinner-sets",
    store_type: "crockery",
    description: "Complete bone china, porcelain, and ceramic dinnerware sets.",
    image_url: "/images/catalog/dinner-set.jpg",
    display_order: 1,
  },
  {
    id: "cat-bowls",
    name: "Bowls",
    slug: "bowls",
    store_type: "crockery",
    description: "Serving bowls, soup bowls, and individual katoris.",
    image_url: "/images/catalog/bowls.jpg",
    display_order: 2,
  },
  {
    id: "cat-cups-mugs",
    name: "Cups & Mugs",
    slug: "cups-mugs",
    store_type: "crockery",
    description: "Tea sets, coffee mugs, and qehwa cups.",
    image_url: "/images/catalog/cups-mugs.jpg",
    display_order: 3,
  },
  {
    id: "cat-plates-platters",
    name: "Plates & Platters",
    slug: "plates-platters",
    store_type: "crockery",
    description: "Dinner plates, quarter plates, and serving platters.",
    image_url: "/images/catalog/plates-platters.jpg",
    display_order: 4,
  },
  {
    id: "cat-serving-dishes",
    name: "Serving Dishes",
    slug: "serving-dishes",
    store_type: "crockery",
    description: "Covered tureens, handis, and serving dishes.",
    image_url: "/images/catalog/serving-dishes.jpg",
    display_order: 5,
  },
  {
    id: "cat-glassware",
    name: "Glassware",
    slug: "glassware",
    store_type: "crockery",
    description: "Tumblers, water jugs, and glass drinkware.",
    image_url: "/images/catalog/glassware.jpg",
    display_order: 6,
  },
  {
    id: "cat-rtw-suits",
    name: "Ready-to-Wear Suits",
    slug: "ready-to-wear-suits",
    store_type: "boutique",
    description: "Stitched 2-piece and 3-piece lawn, cotton, and pret suits.",
    image_url: "/images/catalog/boutique-suits.jpg",
    display_order: 7,
  },
  {
    id: "cat-festive-pret",
    name: "Festive & Formal Pret",
    slug: "festive-pret",
    store_type: "boutique",
    description: "Embroidered chiffon, silk, and organza formal outfits.",
    image_url: "/images/catalog/boutique-festive.jpg",
    display_order: 8,
  },
  {
    id: "cat-heels-sandals",
    name: "Heels & Sandals",
    slug: "heels-sandals",
    store_type: "shoes",
    description: "Block heels, wedges, and formal party sandals.",
    image_url: "/images/catalog/shoes-heels.jpg",
    display_order: 9,
  },
  {
    id: "cat-khussas-flats",
    name: "Khussas & Flats",
    slug: "khussas-flats",
    store_type: "shoes",
    description: "Handcrafted tilla khussas, mules, and cushioned everyday flats.",
    image_url: "/images/catalog/shoes-khussa.jpg",
    display_order: 10,
  },
];

