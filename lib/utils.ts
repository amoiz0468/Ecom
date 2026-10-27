import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
 * Validates and normalizes Pakistani phone numbers:
 * Accepts: 03001234567, 0300-1234567, +923001234567, 923001234567
 * Returns formatted: +923001234567
 */
export function normalizePakistaniPhone(phone: string): { isValid: boolean; normalized: string; display: string } {
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
    // Format for display: 0300-1234567
    const local = "0" + standard.slice(3);
    const display = `${local.slice(0, 4)}-${local.slice(4)}`;
    return { isValid: true, normalized: standard, display };
  }

  return { isValid: false, normalized: phone, display: phone };
}
