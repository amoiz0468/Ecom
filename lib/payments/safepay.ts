import crypto from "crypto";
import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from "./types";
import { Order } from "@/types";

export class SafepayProvider implements PaymentProvider {
  id = "safepay" as const;
  name = "Debit / Credit Card & Wallets (Safepay Pakistan)";
  description = "Pay securely using Pakistani Visa, Mastercard, PayPak, or UnionPay.";

  private apiKey = process.env.SAFEPAY_API_KEY || "sec_sand_dummy_key";
  private secretKey = process.env.SAFEPAY_SECRET_KEY || "sand_dummy_secret";
  private baseUrl = process.env.NEXT_PUBLIC_SAFEPAY_URL || "https://sandbox.api.getsafepay.com";

  isAvailable(): { available: boolean } {
    return { available: true };
  }

  async initiatePayment(order: Order): Promise<PaymentInitiationResult> {
    try {
      // In sandbox mode, we generate a mock/sandbox checkout token tracker
      const trackerToken = `track_${crypto.randomBytes(8).toString("hex")}`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Simulated sandbox redirect URL
      const redirectUrl = `${appUrl}/checkout/success/${order.id}?gateway=safepay&token=${trackerToken}`;

      return {
        success: true,
        orderId: order.id,
        provider: this.id,
        redirectUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        orderId: order.id,
        provider: this.id,
        error: err.message || "Failed to initiate online card payment.",
      };
    }
  }

  async verifyPayment(params: {
    orderId: string;
    signature?: string;
    payload?: string;
  }): Promise<PaymentVerificationResult> {
    // If webhook signature is present, verify with HMAC SHA256
    if (params.signature && params.payload) {
      const computed = crypto
        .createHmac("sha256", this.secretKey)
        .update(params.payload)
        .digest("hex");

      if (computed !== params.signature) {
        return {
          verified: false,
          orderId: params.orderId,
          amountPkr: 0,
          error: "Invalid webhook HMAC signature.",
        };
      }
    }

    return {
      verified: true,
      orderId: params.orderId,
      amountPkr: 0,
      transactionReference: `SPAY-${Date.now()}`,
    };
  }
}
