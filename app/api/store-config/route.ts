import { NextResponse } from "next/server";
import { CatalogRepository, SettingsRepository } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = CatalogRepository.getAllCategories();
    const settings = SettingsRepository.getStoreSettings();
    const shippingZones = SettingsRepository.getShippingZones();

    return NextResponse.json({
      categories,
      settings,
      shippingZones,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load store configuration." },
      { status: 500 }
    );
  }
}

