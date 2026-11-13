import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { StoreSettings } from "@/types";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SHIPPING_ZONES,
} from "@/lib/data/constants";
import { SupabaseSync } from "@/lib/db/supabase-sync";

const DATA_DIR = path.join(process.cwd(), "data");
export const SQLITE_DB_PATH = path.join(DATA_DIR, "khaak-khazaf.sqlite");

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export function getDefaultStoreSettings(): StoreSettings {
  return {
    store_name: process.env.NEXT_PUBLIC_STORE_NAME || "Almoin Crockery",
    whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923001234567",
    store_phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+92 21 35812345",
    store_email:
      process.env.NEXT_PUBLIC_STORE_EMAIL || "support@almoincrockery.pk",
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
      process.env.NEXT_PUBLIC_BANK_TITLE || "ALMOIN CROCKERY",
    bank_iban: process.env.NEXT_PUBLIC_BANK_IBAN || "PK12MEZN0001020304050607",
    jazzcash_number: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || "03001234567",
    easypaisa_number: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || "03451234567",
  };
}

const globalForSqlite = globalThis as unknown as {
  sqliteDb?: DatabaseSync;
  sqliteInitialized?: boolean;
};

export function hashPasswordScrypt(password: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, actualSalt, 64).toString("hex");
  return `${actualSalt}:${derivedKey}`;
}

export function verifyPasswordScrypt(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedKey.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derivedKey, keyBuffer);
}

export function getSqliteDb(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!globalForSqlite.sqliteDb) {
    const db = new DatabaseSync(SQLITE_DB_PATH);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec("PRAGMA busy_timeout = 5000;");
    globalForSqlite.sqliteDb = db;
  }

  if (!globalForSqlite.sqliteInitialized) {
    initializeSchema(globalForSqlite.sqliteDb);
    seedCoreConfigIfNeeded(globalForSqlite.sqliteDb);
    globalForSqlite.sqliteInitialized = true;
  }

  return globalForSqlite.sqliteDb;
}

export function withTransaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION;");
  try {
    const result = fn(db);
    db.exec("COMMIT;");
    return result;
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

function initializeSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      material TEXT NOT NULL DEFAULT 'Bone China',
      care_instructions_json TEXT NOT NULL,
      is_fragile INTEGER NOT NULL DEFAULT 1,
      breakage_guarantee TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT,
      seo_description TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published, is_featured);

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      title TEXT NOT NULL,
      price INTEGER NOT NULL,
      compare_at_price INTEGER,
      stock INTEGER NOT NULL DEFAULT 0,
      weight_grams INTEGER NOT NULL DEFAULT 500,
      dimensions_json TEXT NOT NULL,
      piece_count INTEGER NOT NULL DEFAULT 1,
      attributes_json TEXT NOT NULL DEFAULT '{}',
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_id TEXT,
      image_url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      guest_info_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      shipping_address_json TEXT NOT NULL,
      subtotal_pkr INTEGER NOT NULL,
      discount_pkr INTEGER NOT NULL DEFAULT 0,
      shipping_fee_pkr INTEGER NOT NULL DEFAULT 0,
      cod_fee_pkr INTEGER NOT NULL DEFAULT 0,
      fragile_packaging_fee_pkr INTEGER NOT NULL DEFAULT 0,
      total_pkr INTEGER NOT NULL,
      notes TEXT,
      courier_code TEXT NOT NULL DEFAULT 'tcs',
      tracking_number TEXT,
      tracking_url TEXT,
      payment_proof_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      variant_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      variant_title TEXT NOT NULL,
      sku TEXT NOT NULL,
      price_pkr INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_pkr INTEGER NOT NULL,
      image_url TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

    CREATE TABLE IF NOT EXISTS discounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      min_order_amount_pkr INTEGER NOT NULL DEFAULT 0,
      usage_limit INTEGER,
      times_used INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);

    CREATE TABLE IF NOT EXISTS shipping_zones (
      id TEXT PRIMARY KEY,
      zone_name TEXT NOT NULL,
      cities_json TEXT NOT NULL,
      base_weight_grams INTEGER NOT NULL,
      base_rate_pkr INTEGER NOT NULL,
      per_kg_extra_pkr INTEGER NOT NULL,
      free_shipping_threshold_pkr INTEGER NOT NULL,
      cod_fee_pkr INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      settings_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      last_login_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON customer_inquiries(created_at DESC);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
  `);

  try {
    db.exec("ALTER TABLE orders ADD COLUMN payment_proof_url TEXT;");
  } catch {
    // Column already exists
  }
}

function seedCoreConfigIfNeeded(db: DatabaseSync): void {
  // 1. Ensure default admin user exists
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "KhaakAdmin2026!";
  const existingAdmin = db
    .prepare("SELECT id FROM admin_users WHERE username = ?")
    .get(adminUsername) as { id: string } | undefined;

  if (!existingAdmin) {
    db.prepare(
      `INSERT INTO admin_users (id, username, password_hash, role, created_at)
       VALUES (?, ?, ?, 'admin', ?)`
    ).run(
      "admin-primary",
      adminUsername,
      hashPasswordScrypt(adminPassword),
      new Date().toISOString()
    );
  }

  // 2. Check if store_settings is already initialized (never re-seed mock data!)
  const settingsCount = db
    .prepare("SELECT COUNT(*) as count FROM store_settings")
    .get() as { count: number };

  if (settingsCount && settingsCount.count > 0) {
    return;
  }

  const nowIso = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE TRANSACTION;");
  try {
    // Seed initial department categories only on first DB creation
    const insertCat = db.prepare(`
      INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const c of DEFAULT_CATEGORIES) {
      insertCat.run(
        c.id,
        c.name,
        c.slug,
        c.description || "",
        c.image_url || "",
        c.display_order || 1
      );
    }

    // Seed Pakistan courier shipping zones
    const insertZone = db.prepare(`
      INSERT OR REPLACE INTO shipping_zones (
        id, zone_name, cities_json, base_weight_grams,
        base_rate_pkr, per_kg_extra_pkr, free_shipping_threshold_pkr, cod_fee_pkr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const z of DEFAULT_SHIPPING_ZONES) {
      insertZone.run(
        z.id,
        z.zone_name,
        JSON.stringify(z.cities),
        z.base_weight_grams,
        z.base_rate_pkr,
        z.per_kg_extra_pkr,
        z.free_shipping_threshold_pkr,
        z.cod_fee_pkr
      );
    }

    // Seed store settings
    db.prepare(`
      INSERT OR REPLACE INTO store_settings (id, settings_json, updated_at)
      VALUES (1, ?, ?)
    `).run(JSON.stringify(getDefaultStoreSettings()), nowIso);

    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export function appendAuditLog(entry: {
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address?: string;
}): void {
  try {
    const db = getSqliteDb();
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entry.actor,
      entry.action,
      entry.entity_type,
      entry.entity_id,
      entry.details,
      entry.ip_address ?? null,
      nowIso
    );
    SupabaseSync.insertAuditLog({ ...entry, created_at: nowIso });
  } catch {
    // Non-blocking audit log
  }
}
