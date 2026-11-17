import { NextResponse } from "next/server";
import { CatalogRepository, SettingsRepository } from "@/lib/db/repositories";

export const revalidate = 60;

export async function GET() {
  try {
    const [categories, settings, shippingZones] = await Promise.all([
      CatalogRepository.getAllCategories(),
      SettingsRepository.getStoreSettings(),
      SettingsRepository.getShippingZones(),
    ]);

    return NextResponse.json(
      {
        categories,
        settings,
        shippingZones,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load store configuration." },
      { status: 500 }
    );
  }
}

