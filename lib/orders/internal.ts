import { revalidatePath } from "next/cache";
import { Order, OrderStatus, PaymentStatus, CourierCode } from "@/types";
import { OrderRepository } from "@/lib/db/repositories";

/**
 * Server-internal order status change. This module intentionally has NO
 * "use server" directive: functions in "use server" files become public HTTP
 * endpoints, and this one performs no authentication of its own. Callers must
 * be either an authenticated admin action or a signature-verified webhook.
 */
export async function applyOrderStatusUpdate(
  orderId: string,
  status: OrderStatus,
  paymentStatus: PaymentStatus | undefined,
  trackingNumber: string | undefined,
  courierCode: CourierCode | undefined,
  actor: string
): Promise<Order | null> {
  const updated = await OrderRepository.updateOrderStatusTransaction(
    orderId,
    status,
    paymentStatus,
    trackingNumber,
    courierCode,
    actor
  );
  if (!updated) return null;

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  return updated;
}

