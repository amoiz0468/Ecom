import { NextResponse } from "next/server";
import { getSqliteDb, SQLITE_DB_PATH } from "@/lib/db/sqlite";

export async function GET() {
  const start = performance.now();
  try {
    const db = getSqliteDb();

    const journalRow = db.prepare("PRAGMA journal_mode;").get() as {
      journal_mode: string;
    };
    const fkRow = db.prepare("PRAGMA foreign_keys;").get() as {
      foreign_keys: number;
    };

    const counts = db
      .prepare(`
        SELECT
          (SELECT COUNT(*) FROM products) as products,
          (SELECT COUNT(*) FROM product_variants) as variants,
          (SELECT COUNT(*) FROM categories) as categories,
          (SELECT COUNT(*) FROM orders) as orders,
          (SELECT COUNT(*) FROM discounts) as discounts,
          (SELECT COUNT(*) FROM audit_logs) as audit_logs
      `)
      .get() as Record<string, number>;

    const latencyMs = Number((performance.now() - start).toFixed(2));

    return NextResponse.json({
      status: "healthy",
      engine: "node:sqlite (DatabaseSync)",
      databasePath: SQLITE_DB_PATH,
      pragmas: {
        journalMode: journalRow?.journal_mode || "wal",
        foreignKeys: Boolean(fkRow?.foreign_keys),
      },
      tables: counts,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "degraded",
        error: err.message || "Database health check failed",
      },
      { status: 500 }
    );
  }
}

