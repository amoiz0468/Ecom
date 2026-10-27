import { CourierCode } from "@/types";

export interface CourierInfo {
  code: CourierCode;
  name: string;
  trackingUrlTemplate: string;
  getTrackingUrl: (trackingNumber: string) => string;
}

export const COURIERS: Record<CourierCode, CourierInfo> = {
  tcs: {
    code: "tcs",
    name: "TCS Express Pakistan",
    trackingUrlTemplate: "https://www.tcsexpress.com/tracking?track={trackingNumber}",
    getTrackingUrl: (tn) => `https://www.tcsexpress.com/tracking?track=${encodeURIComponent(tn)}`,
  },
  leopards: {
    code: "leopards",
    name: "Leopards Courier",
    trackingUrlTemplate: "https://leopardscourier.com/tracking?track={trackingNumber}",
    getTrackingUrl: (tn) => `https://leopardscourier.com/tracking?track=${encodeURIComponent(tn)}`,
  },
  postex: {
    code: "postex",
    name: "PostEx Pakistan",
    trackingUrlTemplate: "https://postex.pk/tracking?tracking_id={trackingNumber}",
    getTrackingUrl: (tn) => `https://postex.pk/tracking?tracking_id=${encodeURIComponent(tn)}`,
  },
  trax: {
    code: "trax",
    name: "Trax Logistics",
    trackingUrlTemplate: "https://trax.pk/tracking?tracking_number={trackingNumber}",
    getTrackingUrl: (tn) => `https://trax.pk/tracking?tracking_number=${encodeURIComponent(tn)}`,
  },
  manual: {
    code: "manual",
    name: "Standard Direct Dispatch",
    trackingUrlTemplate: "",
    getTrackingUrl: () => "",
  },
};

export function getCourier(code: CourierCode): CourierInfo {
  return COURIERS[code] || COURIERS.manual;
}
