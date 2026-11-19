"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentProviderId,
  CartItem,
  CourierCode,
} from "@/types";
import { normalizePakistaniPhone, calculateShippingFee } from "@/lib/utils";
import {
  CatalogRepository,
  OrderRepository,
  DiscountRepository,
  SettingsRepository,
} from "@/lib/db/repositories";
import { getPaymentProvider } from "@/lib/payments";
import { requireAdminAuth } from "@/lib/auth/admin";
import { PlaceOrderInputSchema } from "@/lib/validators";
import { sendOrderConfirmationEmail } from "@/lib/notifications/email";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { phoneMatchesOrder } from "@/lib/orders/verify";
import { applyOrderStatusUpdate } from "@/lib/orders/internal";

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

function generateOrderNumber(attempt: number): string {
  // 5 digits normally; widen the range if we keep colliding.
  return attempt < 3
    ? `PK-CROCK-${crypto.randomInt(10000, 100000)}`
    : `PK-CROCK-${crypto.randomInt(100000, 1000000)}`;
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

    // 3. Server-side price, weight and stock verification (only the variants
    //    in this basket are loaded, never the whole catalog)
    const variantLookup = await CatalogRepository.getCheckoutVariants(
      input.items.map((item) => item.variant_id)
    );

    // Unguessable id: the success page URL (/checkout/success/<id>) is the
    // customer's capability link to their own order details.
    const orderId = `ord_${crypto.randomUUID().replace(/-/g, "")}`;

    let subtotal = 0;
    let totalWeight = 0;
    const verifiedItems: Order["items"] = [];

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
        id: `oi_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
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

    const [storeSettings, shippingZones] = await Promise.all([
      SettingsRepository.getStoreSettings(),
      SettingsRepository.getShippingZones(),
    ]);

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
      const matchedCoupon = await DiscountRepository.findByCode(codeUpper);

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
    const initialPaymentStatus: PaymentStatus =
      input.paymentMethod === "manual_transfer"
        ? "awaiting_verification"
        : "unpaid";

    const nowIso = new Date().toISOString();
    const buildOrder = (orderNumber: string): Order => ({
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
      created_at: nowIso,
      updated_at: nowIso,
    });

    // 6. Atomic Postgres transaction (stock check + deduct + coupon + order +
    //    items). Retry with a fresh order number on a rare number collision.
    let order: Order | null = null;
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      const candidate = buildOrder(generateOrderNumber(attempt));
      try {
        order = await OrderRepository.createOrderTransaction(
          candidate,
          appliedCouponCode
        );
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "23505" && attempt < 4) continue;
        throw err;
      }
    }
    if (!order) {
      return {
        success: false,
        error: "Could not generate an order number. Please try again.",
      };
    }

    // 7. Dispatch transactional email confirmation (never fails the order)
    try {
      await sendOrderConfirmationEmail(order);
    } catch {
      // ignore email errors
    }

    // 8. Initiate Payment via Provider
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
  } catch (err) {
    return {
      success: false,
      error:
        (err instanceof Error && err.message) ||
        "Failed to process order. Please try again.",
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

  const matched = await DiscountRepository.findByCode(clean);
  if (!matched || !matched.is_active) {
    return {
      valid: false,
      discountPkr: 0,
      message: "Invalid or expired coupon code.",
    };
  }

  if (matched.usage_limit && matched.times_used >= matched.usage_limit) {
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

/**
 * Public order tracking. Requires BOTH the order reference and the phone
 * number used at checkout, so an order number alone never exposes a
 * customer's name, phone or address.
 */
export async function trackOrderAction(
  reference: string,
  phone: string
): Promise<{ order: Order | null; error?: string }> {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rate = checkRateLimit(`order-track:${ip}`, 20, 60 * 1000);
  if (!rate.allowed) {
    return {
      order: null,
      error: `Too many attempts. Please wait ${rate.retryAfterSeconds}s and try again.`,
    };
  }

  const ref = reference.trim();
  if (!ref || !phone.trim()) {
    return {
      order: null,
      error: "Please enter both your order reference and phone number.",
    };
  }

  const order = await OrderRepository.getOrderByIdOrNumber(ref);
  // Same response for "not found" and "wrong phone" so references can't be probed.
  if (!order || !phoneMatchesOrder(order, phone)) {
    return { order: null };
  }
  return { order };
}

export async function getOrderById(idOrNumber: string): Promise<Order | null> {
  return OrderRepository.getOrderByIdOrNumber(idOrNumber);
}

export async function getAllOrders(options?: {
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  await requireAdminAuth();
  return OrderRepository.getAllOrders(options);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  trackingNumber?: string,
  courierCode?: CourierCode
): Promise<Order | null> {
  const session = await requireAdminAuth();
  return applyOrderStatusUpdate(
    orderId,
    status,
    paymentStatus,
    trackingNumber,
    courierCode,
    session.username
  );
}

export async function updateOrderDetailsAction(
  orderId: string,
  updates: {
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    recipient_name?: string;
    shipping_phone?: string;
    street_address?: string;
    landmark?: string;
    city?: string;
    province?: string;
    notes?: string;
    courier_code?: CourierCode;
    tracking_number?: string;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_fee_pkr?: number;
    discount_pkr?: number;
  }
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const session = await requireAdminAuth();
    const updated = await OrderRepository.updateOrderDetails(
      orderId,
      updates,
      session.username
    );
    if (!updated) {
      return { success: false, error: "Order not found." };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${updated.id}/invoice`);
    return { success: true, order: updated };
  } catch (err) {
    return {
      success: false,
      error:
        (err instanceof Error && err.message) ||
        "Failed to update order details.",
    };
  }
}

export async function deleteOrderAction(orderId: string): Promise<{
  success: boolean;
}> {
  const session = await requireAdminAuth();
  await OrderRepository.deleteOrder(orderId, session.username);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  return { success: true };
}
