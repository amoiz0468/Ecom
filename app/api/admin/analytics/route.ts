import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { AnalyticsRepository } from "@/lib/db/repositories";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin credentials required" },
      { status: 401 }
    );
  }

  const metrics = await AnalyticsRepository.getDashboardMetrics();
  return NextResponse.json({
    success: true,
    metrics,
    generatedAt: new Date().toISOString(),
  });
}

