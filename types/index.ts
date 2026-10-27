export type UserRole = "customer" | "admin" | "support";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "awaiting_verification" | "paid" | "refunded";

export type PaymentProviderId = "cod" | "manual_transfer" | "safepay" | "payfast";

export type CourierCode = "manual" | "tcs" | "leopards" | "postex" | "trax";

export interface CareInstructions {
  dishwasher_safe: boolean;
  microwave_safe: boolean;
  oven_safe: boolean;
  handwash_only: boolean;
}

export interface Dimensions {
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  title: string;
  price: number; // PKR whole integer
  compare_at_price?: number;
  stock: number;
  weight_grams: number;
  dimensions: Dimensions;
  piece_count: number;
  attributes: Record<string, string>;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id?: string | null;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category?: Category;
  material: string;
  care_instructions: CareInstructions;
  is_fragile: boolean;
  breakage_guarantee: string;
  is_featured: boolean;
  is_published: boolean;
  seo_title?: string;
  seo_description?: string;
  variants: ProductVariant[];
  images: ProductImage[];
  rating?: number;
  review_count?: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface PakistaniAddress {
  recipient_name: string;
  phone: string;
  alternate_phone?: string;
  street_address: string;
  landmark?: string;
  city: string;
  province: string;
  postal_code?: string;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  cnic_optional?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string;
  sku: string;
  price_pkr: number;
  quantity: number;
  total_pkr: number;
  image_url?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  provider: PaymentProviderId;
  method: string;
  amount_pkr: number;
  status: "pending" | "awaiting_review" | "completed" | "failed" | "refunded";
  transaction_reference?: string;
  proof_image_url?: string;
  admin_notes?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  guest_info: GuestInfo;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: PakistaniAddress;
  subtotal_pkr: number;
  discount_pkr: number;
  shipping_fee_pkr: number;
  cod_fee_pkr: number;
  fragile_packaging_fee_pkr: number;
  total_pkr: number;
  notes?: string;
  courier_code: CourierCode;
  tracking_number?: string;
  tracking_url?: string;
  items: OrderItem[];
  payment?: PaymentRecord;
  created_at: string;
  updated_at: string;
}

export interface ShippingZone {
  id: string;
  zone_name: string;
  cities: string[];
  base_weight_grams: number;
  base_rate_pkr: number;
  per_kg_extra_pkr: number;
  free_shipping_threshold_pkr: number;
  cod_fee_pkr: number;
}
