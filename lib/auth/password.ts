import crypto from "node:crypto";

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

