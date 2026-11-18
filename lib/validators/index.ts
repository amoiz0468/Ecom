import { z } from "zod";

export const PakistaniAddressSchema = z.object({
  recipient_name: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters."),
  phone: z
    .string()
    .trim()
    .min(10, "Valid Pakistani mobile number is required."),
  alternate_phone: z.string().optional(),
  street_address: z
    .string()
    .trim()
    .min(5, "Complete street/house delivery address is required."),
  landmark: z.string().optional(),
  city: z.string().trim().min(2, "City is required."),
  province: z.string().trim().min(2, "Province is required."),
  postal_code: z.string().optional(),
});

export const PlaceOrderInputSchema = z.object({
  guestInfo: z.object({
    name: z.string().trim().min(2, "Full name is required."),
    email: z
      .string()
      .trim()
      .email("Valid email address is required.")
      .or(z.literal("")),
    phone: z.string().trim().min(10, "Valid phone number is required."),
  }),
  shippingAddress: PakistaniAddressSchema,
  paymentMethod: z.enum(["cod", "manual_transfer", "safepay", "payfast"]),
  extraPackaging: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
  discountCode: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        product_id: z.string(),
        variant_id: z.string(),
        quantity: z.number().int().min(1).max(99),
        product: z.any(),
        variant: z.any(),
      })
    )
    .min(1, "Your basket cannot be empty."),
});

export const ProductVariantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "SKU is required."),
  title: z.string().trim().min(1, "Variant title is required."),
  price: z.coerce.number().min(0, "Price must be >= 0."),
  compare_at_price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  piece_count: z.coerce.number().int().min(1).default(1),
  weight_grams: z.coerce.number().int().min(50).default(500),
});

export const StoreDepartmentSchema = z.enum(["crockery", "boutique", "shoes"]);

export const SaveProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Product name is required."),
  slug: z.string().optional(),
  description: z.string().trim().default("Curated quality piece from Almoin Store."),
  category_id: z.string().trim().min(1, "Category is required."),
  store_type: StoreDepartmentSchema.default("crockery"),
  material: z.string().trim().default("Bone China"),
  image_url: z.string().trim().default(""),
  image_urls: z.array(z.string().trim()).optional(),
  dishwasher_safe: z.boolean().default(true),
  microwave_safe: z.boolean().default(true),
  oven_safe: z.boolean().default(false),
  handwash_only: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  variants: z
    .array(ProductVariantInputSchema)
    .min(1, "At least one SKU variant is required."),
});

export const SaveCategoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name is required."),
  slug: z.string().optional(),
  store_type: StoreDepartmentSchema.default("crockery"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  display_order: z.coerce.number().int().min(1).optional(),
});

export const SaveDiscountInputSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters.")
    .max(32),
  description: z.string().trim().default("Special store promotion"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(1, "Discount value must be >= 1."),
  min_order_amount_pkr: z.coerce.number().min(0).default(0),
  usage_limit: z.coerce.number().int().min(1).optional(),
});

export const UpdateOrderStatusInputSchema = z.object({
  orderId: z.string().trim().min(1, "orderId is required."),
  status: z.enum([
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]),
  paymentStatus: z
    .enum(["unpaid", "awaiting_verification", "paid", "refunded"])
    .optional(),
  trackingNumber: z.string().optional(),
  courierCode: z
    .enum(["manual", "tcs", "leopards", "postex", "trax"])
    .optional(),
});

export const AdminLoginInputSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

