import { NextRequest, NextResponse } from "next/server";
import { validateCouponAction } from "@/lib/orders";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`coupon-validate:${ip}`, 30, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          valid: false,
          discountPkr: 0,
          message: `Too many attempts. Try again in ${rate.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const code = String(body.code || "");
    const subtotal = Number(body.subtotal || 0);

    const result = await validateCouponAction(code, subtotal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, discountPkr: 0, message: "Failed to validate coupon." },
      { status: 400 }
    );
  }
}

