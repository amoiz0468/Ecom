import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ShippingZone } from "@/types";
import { DEFAULT_SHIPPING_ZONES } from "@/lib/data/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer PKR amount into a standard Pakistani rupee string.
 * Example: 4500 -> "Rs. 4,500"
 */
export function formatPKR(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK").format(Math.round(amount))}`;
}

/**
 * Calculate shipping fee in PKR based on Pakistani city zone, parcel weight (grams), and subtotal.
 * Accepts optional live shipping zones and free-shipping threshold from the SQLite database.
 */
export function calculateShippingFee(
  city: string,
  totalWeightGrams: number,
  subtotal: number,
  zones: ShippingZone[] = DEFAULT_SHIPPING_ZONES,
  freeShippingThresholdPkr?: number
): number {
  const activeZones = zones.length > 0 ? zones : DEFAULT_SHIPPING_ZONES;
  const zone =
    activeZones.find((z) => z.cities.includes(city)) ||
    activeZones.find((z) => z.id === "zone-rest") ||
    activeZones[0];

  const threshold =
    freeShippingThresholdPkr ?? zone.free_shipping_threshold_pkr ?? 5000;

  if (subtotal >= threshold) {
    return 0;
  }

  const baseRate = zone.base_rate_pkr;
  const extraWeightKg = Math.max(
    0,
    Math.ceil((totalWeightGrams - zone.base_weight_grams) / 1000)
  );
  const extraCharge = extraWeightKg * zone.per_kg_extra_pkr;

  return baseRate + extraCharge;
}

/**
 * Validates and normalizes Pakistani phone numbers:
 * Accepts: 03001234567, 0300-1234567, +923001234567, 923001234567
 * Returns formatted: +923001234567
 */
export function normalizePakistaniPhone(phone: string): {
  isValid: boolean;
  normalized: string;
  display: string;
} {
  const digits = phone.replace(/\D/g, "");
  let standard = "";

  if (digits.startsWith("923") && digits.length === 12) {
    standard = `+${digits}`;
  } else if (digits.startsWith("03") && digits.length === 11) {
    standard = `+92${digits.slice(1)}`;
  } else if (digits.startsWith("3") && digits.length === 10) {
    standard = `+92${digits}`;
  }

  if (standard.length === 13 && /^\+923\d{9}$/.test(standard)) {
    const local = "0" + standard.slice(3);
    const display = `${local.slice(0, 4)}-${local.slice(4)}`;
    return { isValid: true, normalized: standard, display };
  }

  return { isValid: false, normalized: phone, display: phone };
}
