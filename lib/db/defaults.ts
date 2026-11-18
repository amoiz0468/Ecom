import { StoreSettings } from "@/types";

export function getDefaultStoreSettings(): StoreSettings {
  return {
    store_name: process.env.NEXT_PUBLIC_STORE_NAME || "Almoin Store",
    whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567",
    store_phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+92 21 35812345",
    store_email:
      process.env.NEXT_PUBLIC_STORE_EMAIL || "support@almoinstore.pk",
    free_shipping_threshold_pkr: Number(
      process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 5000
    ),
    cod_fee_pkr: Number(process.env.NEXT_PUBLIC_DEFAULT_COD_FEE || 150),
    max_cod_limit_pkr: Number(process.env.NEXT_PUBLIC_MAX_COD_LIMIT || 35000),
    fragile_packaging_fee_pkr: Number(
      process.env.NEXT_PUBLIC_FRAGILE_PACKAGING_FEE || 250
    ),
    bank_name: process.env.NEXT_PUBLIC_BANK_NAME || "Meezan Bank Limited",
    bank_account_title:
      process.env.NEXT_PUBLIC_BANK_TITLE || "ALMOIN STORE",
    bank_iban: process.env.NEXT_PUBLIC_BANK_IBAN || "PK12MEZN0001020304050607",
    jazzcash_number: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || "03001234567",
    easypaisa_number: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || "03451234567",
  };
}

