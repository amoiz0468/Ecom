import { PaymentProvider, PaymentInitiationResult } from "./types";
import { Order } from "@/types";

export class ManualTransferProvider implements PaymentProvider {
  id = "manual_transfer" as const;
  name = "Bank Transfer / JazzCash / Easypaisa";
  description = "Transfer via online banking or mobile wallet and upload the receipt screenshot.";

  isAvailable(): { available: boolean } {
    return { available: true };
  }

  async initiatePayment(order: Order): Promise<PaymentInitiationResult> {
    return {
      success: true,
      orderId: order.id,
      provider: this.id,
      redirectUrl: `/checkout/success/${order.id}?step=upload-proof`,
      paymentDetails: {
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || "Meezan Bank Limited",
        accountTitle: process.env.NEXT_PUBLIC_BANK_TITLE || "KHAAK & KHAZAF CERAMICS",
        iban: process.env.NEXT_PUBLIC_BANK_IBAN || "PK12MEZN0001020304050607",
        instructions: `Please transfer Rs. ${order.total_pkr.toLocaleString()} to our bank account or JazzCash/Easypaisa (${process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || "03001234567"}). Upload the screenshot on the confirmation page or WhatsApp it to ${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567"} with your Order ID #${order.order_number}.`,
      },
    };
  }
}
