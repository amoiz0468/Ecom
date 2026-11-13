"use server";

import { revalidatePath } from "next/cache";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentProviderId,
  CartItem,
  CourierCode,
  Product,
  ProductVariant,
} from "@/types";
import { normalizePakistaniPhone, calculateShippingFee } from "@/lib/utils";
import {
  CatalogRepository,
  OrderRepository,
  DiscountRepository,
  SettingsRepository,
} from "@/lib/db/repositories";
import { getPaymentProvider } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAuth } from "@/lib/auth/admin";
import { PlaceOrderInputSchema } from "@/lib/validators";
import { sendOrderConfirmationEmail } from "@/lib/notifications/email";

export { calculateShippingFee };

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !url.includes("placeholder") &&
      !key.includes("...") &&
      !key.includes("placeholder")
  );
}

export interface PlaceOrderInput {
  guestInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    recipient_name: string;
    phone: string;
    street_address: string;
    landmark?: string;
    city: string;
    province: string;
  };
  paymentMethod: PaymentProviderId;
  extraPackaging: boolean;
  notes?: string;
  items: CartItem[];
  discountCode?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{
  success: boolean;
  order?: Order;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    // 1. Validate input schema with Zod
    const schemaResult = PlaceOrderInputSchema.safeParse(input);
    if (!schemaResult.success) {
      return {
        success: false,
        error:
          schemaResult.error.issues[0]?.message ||
          "Please fill in all required checkout fields.",
      };
    }

    // 2. Phone number normalization & validation
    const phoneCheck = normalizePakistaniPhone(input.guestInfo.phone);
    if (!phoneCheck.isValid) {
      return {
        success: false,
        error:
          "Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567).",
      };
    }

    // 3. Server-side price, weight, and stock verification against published SQLite catalog
    const catalogProducts = CatalogRepository.getAllProducts({
      includeUnpublished: false,
    });
    const variantLookup = new Map<
      string,
      {
        product: Product;
        variant: ProductVariant;
      }
    >();

    for (const p of catalogProducts) {
      for (const v of p.variants) {
        if (v.is_active !== false) {
          variantLookup.set(v.id, { product: p, variant: v });
        }
      }
    }

    let subtotal = 0;
    let totalWeight = 0;
    const verifiedItems: Order["items"] = [];
    const orderId = `ord_${Date.now()}`;

    for (const item of input.items) {
      const authoritative = variantLookup.get(item.variant_id);
      if (!authoritative) {
        return {
          success: false,
          error:
            "One or more items in your basket are no longer available. Please refresh your basket and try again.",
        };
      }

      const { product, variant } = authoritative;
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));

      if (variant.stock < qty) {
        return {
          success: false,
          error: `Sorry, only ${variant.stock} unit(s) of "${product.name} (${variant.title})" are currently in stock.`,
        };
      }

      const unitPrice = variant.price;
      const unitWeight = variant.weight_grams || 500;

      subtotal += unitPrice * qty;
      totalWeight += unitWeight * qty;

      verifiedItems.push({
        id: `oi_${Date.now()}_${variant.id}`,
        order_id: orderId,
        variant_id: variant.id,
        product_title: product.name,
        variant_title: variant.title,
        sku: variant.sku,
        price_pkr: unitPrice,
        quantity: qty,
        total_pkr: unitPrice * qty,
        image_url: product.images[0]?.image_url,
      });
    }

    const storeSettings = SettingsRepository.getStoreSettings();
    const shippingZones = SettingsRepository.getShippingZones();

    const shippingFee = calculateShippingFee(
      input.shippingAddress.city,
      totalWeight,
      subtotal,
      shippingZones,
      storeSettings.free_shipping_threshold_pkr
    );
    const codFee =
      input.paymentMethod === "cod" ? storeSettings.cod_fee_pkr : 0;
    const fragileFee = input.extraPackaging
      ? storeSettings.fragile_packaging_fee_pkr
      : 0;

    let discount = 0;
    let appliedCouponCode: string | undefined;

    if (input.discountCode?.trim()) {
      const codeUpper = input.discountCode.trim().toUpperCase();
      const matchedCoupon = DiscountRepository.findByCode(codeUpper);

      if (
        matchedCoupon &&
        matchedCoupon.is_active &&
        subtotal >= matchedCoupon.min_order_amount_pkr &&
        (!matchedCoupon.usage_limit ||
          matchedCoupon.times_used < matchedCoupon.usage_limit)
      ) {
        if (matchedCoupon.discount_type === "percentage") {
          discount = Math.round(
            subtotal * (matchedCoupon.discount_value / 100)
          );
        } else {
          discount = Math.min(subtotal, matchedCoupon.discount_value);
        }
        appliedCouponCode = codeUpper;
      }
    }

    const total = subtotal - discount + shippingFee + codFee + fragileFee;

    // 4. Check COD availability limits against live store settings
    if (
      input.paymentMethod === "cod" &&
      total > storeSettings.max_cod_limit_pkr
    ) {
      return {
        success: false,
        error: `Cash on Delivery is available up to Rs. ${storeSettings.max_cod_limit_pkr.toLocaleString()}. Please choose Bank Transfer or Online Payment.`,
      };
    }

    const provider = getPaymentProvider(input.paymentMethod);
    const availability = provider.isAvailable(total);
    if (!availability.available) {
      return { success: false, error: availability.reason };
    }

    // 5. Construct Order Object
    const orderNumber = `PK-CROCK-${Math.floor(10000 + Math.random() * 90000)}`;
    const initialPaymentStatus: PaymentStatus =
      input.paymentMethod === "manual_transfer"
        ? "awaiting_verification"
        : "unpaid";

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      guest_info: {
        name: input.guestInfo.name.trim(),
        email: input.guestInfo.email.trim() || "customer@almoincrockery.pk",
        phone: phoneCheck.display,
      },
      status: "pending" as OrderStatus,
      payment_status: initialPaymentStatus,
      payment_method: input.paymentMethod,
      shipping_address: {
        ...input.shippingAddress,
        recipient_name: input.shippingAddress.recipient_name.trim(),
        street_address: input.shippingAddress.street_address.trim(),
        phone: phoneCheck.display,
      },
      subtotal_pkr: subtotal,
      discount_pkr: discount,
      shipping_fee_pkr: shippingFee,
      cod_fee_pkr: codFee,
      fragile_packaging_fee_pkr: fragileFee,
      total_pkr: total,
      notes: input.notes,
      courier_code: "tcs",
      items: verifiedItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 6. Execute atomic SQLite ACID transaction (deduct stock + increment coupon + insert order + audit log)
    OrderRepository.createOrderTransaction(order, appliedCouponCode);

    // 7. Also replicate to Supabase PostgreSQL if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: dbOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: order.order_number,
            guest_info: order.guest_info,
            status: order.status,
            payment_status: order.payment_status,
            shipping_address: order.shipping_address,
            subtotal_pkr: order.subtotal_pkr,
            discount_pkr: order.discount_pkr,
            shipping_fee_pkr: order.shipping_fee_pkr,
            cod_fee_pkr: order.cod_fee_pkr,
            fragile_packaging_fee_pkr: order.fragile_packaging_fee_pkr,
            total_pkr: order.total_pkr,
            notes: order.notes,
            courier_code: order.courier_code,
          })
          .select()
          .single();

        if (!orderError && dbOrder) {
          order.id = dbOrder.id;
          await supabase.from("order_items").insert(
            order.items.map((i) => ({
              order_id: dbOrder.id,
              variant_id: i.variant_id,
              product_title: i.product_title,
              variant_title: i.variant_title,
              sku: i.sku,
              price_pkr: i.price_pkr,
              quantity: i.quantity,
              total_pkr: i.total_pkr,
            }))
          );
          await supabase.rpc("reserve_order_stock", {
            p_order_id: dbOrder.id,
          });
        }
      } catch {
        // Primary SQLite transaction already succeeded
      }
    }

    // 8. Dispatch transactional email confirmation
    await sendOrderConfirmationEmail(order);

    // 9. Initiate Payment via Provider
    const paymentResult = await provider.initiatePayment(order);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");

    return {
      success: true,
      order,
      redirectUrl:
        paymentResult.redirectUrl || `/checkout/success/${order.id}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to process order. Please try again.",
    };
  }
}

export async function validateCouponAction(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  discountPkr: number;
  message: string;
  code?: string;
}> {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return {
      valid: false,
      discountPkr: 0,
      message: "Please enter a coupon code.",
    };
  }

  const matched = DiscountRepository.findByCode(clean);
  if (!matched || !matched.is_active) {
    return {
      valid: false,
      discountPkr: 0,
      message: "Invalid or expired coupon code.",
    };
  }

  if (
    matched.usage_limit &&
    matched.times_used >= matched.usage_limit
  ) {
    return {
      valid: false,
      discountPkr: 0,
      message: `Coupon ${clean} has reached its usage limit.`,
    };
  }

  if (subtotal < matched.min_order_amount_pkr) {
    return {
      valid: false,
      discountPkr: 0,
      message: `Minimum order of Rs. ${matched.min_order_amount_pkr.toLocaleString()} required for ${clean}.`,
    };
  }

  const discountPkr =
    matched.discount_type === "percentage"
      ? Math.round(subtotal * (matched.discount_value / 100))
      : Math.min(subtotal, matched.discount_value);

  return {
    valid: true,
    discountPkr,
    code: clean,
    message: `✓ Coupon ${clean} applied (-Rs. ${discountPkr.toLocaleString()})!`,
  };
}

export async function getOrderById(idOrNumber: string): Promise<Order | null> {
  const found = OrderRepository.getOrderByIdOrNumber(idOrNumber);
  if (found) return found;

  if (isSupabaseConfigured()) {
    try {
      const clean = idOrNumber.trim();
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .or(`id.eq.${clean},order_number.ilike.${clean}`)
        .maybeSingle();

      if (data) {
        return data as unknown as Order;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export async function getAllOrders(options?: {
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      let query = supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (typeof options?.limit === "number" && options.limit > 0) {
        const offset = Math.max(0, Math.floor(options.offset || 0));
        const limit = Math.min(500, Math.floor(options.limit));
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data as unknown as Order[];
      }
    } catch {
      // Fallback to SQLite
    }
  }

  return OrderRepository.getAllOrders(options);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  trackingNumber?: string,
  courierCode?: CourierCode,
  options?: { internalWebhook?: boolean }
): Promise<Order | null> {
  let actor = "safepay-webhook";
  if (!options?.internalWebhook) {
    const session = await requireAdminAuth();
    actor = session.username;
  }

  const updated = OrderRepository.updateOrderStatusTransaction(
    orderId,
    status,
    paymentStatus,
    trackingNumber,
    courierCode,
    actor
  );

  if (!updated) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from("orders")
        .update({
          status: updated.status,
          payment_status: updated.payment_status,
          tracking_number: updated.tracking_number,
          courier_code: updated.courier_code,
          updated_at: updated.updated_at,
        })
        .eq("id", orderId);
    } catch {
      // ignore
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  return updated;
}

export async function deleteOrderAction(orderId: string): Promise<{
  success: boolean;
}> {
  const session = await requireAdminAuth();
  OrderRepository.deleteOrder(orderId, session.username);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  return { success: true };
}
