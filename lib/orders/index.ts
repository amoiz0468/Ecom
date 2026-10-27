import { Order, OrderStatus, PaymentStatus, PaymentProviderId, CartItem } from "@/types";
import { normalizePakistaniPhone } from "@/lib/utils";
import { SHIPPING_ZONES } from "@/lib/data/mock-catalog";
import { getPaymentProvider } from "@/lib/payments";

// In-memory order storage fallback for local development & immediate demo testing
const ordersStore: Map<string, Order> = new Map();

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

export function calculateShippingFee(city: string, totalWeightGrams: number, subtotal: number): number {
  if (subtotal >= 5000) {
    return 0; // Free delivery above 5000 PKR
  }

  // Find zone matching city
  const zone =
    SHIPPING_ZONES.find((z) => z.cities.includes(city)) ||
    SHIPPING_ZONES.find((z) => z.id === "zone-rest") ||
    SHIPPING_ZONES[0];

  const baseRate = zone.base_rate_pkr;
  const extraWeightKg = Math.max(0, Math.ceil((totalWeightGrams - zone.base_weight_grams) / 1000));
  const extraCharge = extraWeightKg * zone.per_kg_extra_pkr;

  return baseRate + extraCharge;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{
  success: boolean;
  order?: Order;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    // 1. Phone number validation
    const phoneCheck = normalizePakistaniPhone(input.guestInfo.phone);
    if (!phoneCheck.isValid) {
      return {
        success: false,
        error: "Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567).",
      };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Your basket is empty." };
    }

    // 2. Calculations
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    const totalWeight = input.items.reduce(
      (sum, item) => sum + (item.variant.weight_grams || 500) * item.quantity,
      0
    );

    const shippingFee = calculateShippingFee(input.shippingAddress.city, totalWeight, subtotal);
    const codFee = input.paymentMethod === "cod" ? 150 : 0;
    const fragileFee = input.extraPackaging ? 250 : 0;

    let discount = 0;
    if (input.discountCode?.trim().toUpperCase() === "WELCOME10") {
      discount = Math.round(subtotal * 0.1);
    }

    const total = subtotal - discount + shippingFee + codFee + fragileFee;

    // 3. Check COD availability limits
    const provider = getPaymentProvider(input.paymentMethod);
    const availability = provider.isAvailable(total);
    if (!availability.available) {
      return { success: false, error: availability.reason };
    }

    // 4. Construct Order Object
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `PK-CROCK-${Math.floor(10000 + Math.random() * 90000)}`;

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      guest_info: {
        name: input.guestInfo.name,
        email: input.guestInfo.email,
        phone: phoneCheck.display,
      },
      status: "pending" as OrderStatus,
      payment_status: "unpaid" as PaymentStatus,
      shipping_address: {
        ...input.shippingAddress,
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
      items: input.items.map((i) => ({
        id: `oi_${Date.now()}_${i.variant_id}`,
        order_id: orderId,
        variant_id: i.variant_id,
        product_title: i.product.name,
        variant_title: i.variant.title,
        sku: i.variant.sku,
        price_pkr: i.variant.price,
        quantity: i.quantity,
        total_pkr: i.variant.price * i.quantity,
        image_url: i.product.images[0]?.image_url,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to memory store
    ordersStore.set(orderId, order);
    ordersStore.set(orderNumber, order);

    // 5. Initiate Payment via Provider
    const paymentResult = await provider.initiatePayment(order);

    return {
      success: true,
      order,
      redirectUrl: paymentResult.redirectUrl || `/checkout/success/${order.id}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to process order. Please try again.",
    };
  }
}

export async function getOrderById(idOrNumber: string): Promise<Order | null> {
  return ordersStore.get(idOrNumber) || null;
}

export async function getAllOrders(): Promise<Order[]> {
  const unique = Array.from(new Set(Array.from(ordersStore.values())));
  return unique.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  trackingNumber?: string
): Promise<Order | null> {
  const order = ordersStore.get(orderId);
  if (!order) return null;

  order.status = status;
  if (paymentStatus) {
    order.payment_status = paymentStatus;
  }
  if (trackingNumber) {
    order.tracking_number = trackingNumber;
  }
  order.updated_at = new Date().toISOString();

  ordersStore.set(orderId, order);
  ordersStore.set(order.order_number, order);
  return order;
}
