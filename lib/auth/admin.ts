import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "almoin_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

export interface AdminSessionPayload {
  username: string;
  role: "admin";
  iat: number;
  exp: number;
}

function getSecretKey(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
  }
  return "dev-only-local-session-secret";
}

export function getExpectedAdminCredentials(): {
  username: string;
  password: string;
} {
  const password = process.env.ADMIN_PASSWORD;
  if (!password && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD must be configured in production.");
  }
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: password || "dev-local-password",
  };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expected = getExpectedAdminCredentials();
  const userMatch = safeCompare(username.trim(), expected.username);
  const passMatch = safeCompare(password, expected.password);
  return userMatch && passMatch;
}

/**
 * Create an HMAC-SHA256 signed session token
 */
export function createAdminSessionToken(username: string): string {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    username,
    role: "admin",
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify an HMAC-SHA256 signed session token and check expiration + role
 */
export function verifyAdminSessionToken(
  token?: string | null
): AdminSessionPayload | null {
  if (!token || !token.includes(".")) return null;

  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", getSecretKey())
      .update(payloadBase64)
      .digest("base64url");

    if (!safeCompare(signature, expectedSig)) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (decoded.role !== "admin") return null;
    if (typeof decoded.exp !== "number" || Date.now() > decoded.exp) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Read and verify the current admin session from Next.js server cookies
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

/**
 * Throw an authorization error if the caller is not an authenticated admin.
 * Used inside Server Actions and API Route Handlers.
 */
export async function requireAdminAuth(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Admin authentication required.");
  }
  return session;
}

