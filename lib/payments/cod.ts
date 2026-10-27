import { PaymentProvider, PaymentInitiationResult } from "./types";
import { Order } from "@/types";

export class CashOnDeliveryProvider implements PaymentProvider {
  id = "cod" as const;
  name = "Cash on Delivery (COD)";
  description = "Pay in cash to the TCS / Leopards rider upon home delivery.";

  private maxLimit = Number(process.env.NEXT_PUBLIC_MAX_COD_LIMIT || 35000);

  isAvailable(subtotalPkr: number): { available: boolean; reason?: string } {
    if (subtotalPkr > this.maxLimit) {
      return {
        available: false,
        reason: `Orders above Rs. ${this.maxLimit.toLocaleString()} require advance bank transfer or online payment for courier transit safety.`,
      };
    }
    return { available: true };
  }

  async initiatePayment(order: Order): Promise<PaymentInitiationResult> {
    const availability = this.isAvailable(order.total_pkr);
    if (!availability.available) {
      return {
        success: false,
        orderId: order.id,
        provider: this.id,
        error: availability.reason,
      };
    }

    return {
      success: true,
      orderId: order.id,
      provider: this.id,
      redirectUrl: `/checkout/success/${order.id}`,
      paymentDetails: {
        instructions:
          "Please keep the exact amount ready in cash when the courier arrives at your doorstep.",
      },
    };
  }
}
