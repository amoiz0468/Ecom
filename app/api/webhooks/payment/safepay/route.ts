import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { updateOrderStatus } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sfpy-signature") || "";

    const payload = JSON.parse(rawBody || "{}");
    const orderId = payload.data?.metadata?.order_id || payload.order_id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id in webhook" }, { status: 400 });
    }

    const safepay = getPaymentProvider("safepay");
    const verification = await safepay.verifyPayment?.({
      orderId,
      signature,
      payload: rawBody,
    });

    if (!verification?.verified) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // Update order status to confirmed and payment to paid
    await updateOrderStatus(orderId, "confirmed", "paid");

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
