import { PaymentProvider } from "./types";
import { PaymentProviderId } from "@/types";
import { CashOnDeliveryProvider } from "./cod";
import { ManualTransferProvider } from "./manual-transfer";
import { SafepayProvider } from "./safepay";

const providers: Record<PaymentProviderId, PaymentProvider> = {
  cod: new CashOnDeliveryProvider(),
  manual_transfer: new ManualTransferProvider(),
  safepay: new SafepayProvider(),
  payfast: new SafepayProvider(), // Default fallback to Safepay architecture
};

export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  const provider = providers[id];
  if (!provider) {
    return providers.cod;
  }
  return provider;
}

export function getAllPaymentProviders(): PaymentProvider[] {
  return [providers.cod, providers.manual_transfer, providers.safepay];
}
