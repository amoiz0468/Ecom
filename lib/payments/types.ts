import { Order, PaymentProviderId } from "@/types";

export interface PaymentInitiationResult {
  success: boolean;
  orderId: string;
  provider: PaymentProviderId;
  redirectUrl?: string;
  paymentDetails?: {
    accountTitle?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    instructions?: string;
  };
  error?: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  orderId: string;
  amountPkr: number;
  transactionReference?: string;
  error?: string;
}

export interface PaymentProvider {
  id: PaymentProviderId;
  name: string;
  description: string;
  isAvailable(subtotalPkr: number): { available: boolean; reason?: string };
  initiatePayment(order: Order, payload?: any): Promise<PaymentInitiationResult>;
  verifyPayment?(params: any): Promise<PaymentVerificationResult>;
}
