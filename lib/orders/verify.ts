import { Order } from "@/types";

function lastTenDigits(value: string | undefined | null): string {
  return (value || "").replace(/\D/g, "").slice(-10);
}

/**
 * True when the supplied phone number matches the customer (or shipping)
 * phone on the order. Used to gate any customer-facing order lookup so an
 * order number alone never reveals names, phones or addresses.
 */
export function phoneMatchesOrder(order: Order, phone: string | null | undefined): boolean {
  const provided = lastTenDigits(phone);
  if (provided.length < 10) return false;
  return (
    provided === lastTenDigits(order.guest_info?.phone) ||
    provided === lastTenDigits(order.shipping_address?.phone)
  );
}

