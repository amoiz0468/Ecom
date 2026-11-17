import {
  formatPKR,
  normalizePakistaniPhone,
  calculateShippingFee,
} from "../lib/utils";
import { CashOnDeliveryProvider } from "../lib/payments/cod";
import {
  hashPasswordScrypt,
  verifyPasswordScrypt,
} from "../lib/auth/password";
import { checkRateLimit } from "../lib/security/rate-limit";
import { SaveProductInputSchema } from "../lib/validators";
import {
  parseCloudinaryUrl,
  signCloudinaryParams,
  injectCloudinaryAutoOptimize,
} from "../lib/media/cloudinary";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log("\n--- RUNNING CROCKERY E-COMMERCE & BACKEND TESTS ---\n");

// 1. PKR Currency Formatting
console.log("1. Testing PKR Currency Formatter...");
assert(formatPKR(4500) === "Rs. 4,500", "4500 formatted to 'Rs. 4,500'");
assert(formatPKR(28500) === "Rs. 28,500", "28500 formatted to 'Rs. 28,500'");
assert(formatPKR(0) === "Rs. 0", "0 formatted to 'Rs. 0'");

// 2. Pakistani Phone Number Validation & Normalization
console.log("\n2. Testing Pakistani Phone Normalization...");
const p1 = normalizePakistaniPhone("03001234567");
assert(
  p1.isValid &&
    p1.display === "0300-1234567" &&
    p1.normalized === "+923001234567",
  "Normalizes 03001234567"
);

const p2 = normalizePakistaniPhone("+923451234567");
assert(p2.isValid && p2.display === "0345-1234567", "Normalizes +923451234567");

const p3 = normalizePakistaniPhone("0312-9876543");
assert(
  p3.isValid && p3.display === "0312-9876543",
  "Normalizes hyphenated 0312-9876543"
);

const pInvalid = normalizePakistaniPhone("12345");
assert(!pInvalid.isValid, "Rejects invalid short numbers");

// 3. Shipping Fee Calculations
console.log("\n3. Testing Pakistani Shipping Rates by Zone & Weight...");
assert(
  calculateShippingFee("Lahore", 2000, 5200) === 0,
  "Free delivery for orders >= Rs. 5,000"
);
assert(
  calculateShippingFee("Karachi", 12000, 28500) === 0,
  "Free delivery on heavy dinner set over threshold"
);
assert(
  calculateShippingFee("Karachi", 800, 3000) === 200,
  "Karachi base shipping under 1kg is Rs. 200"
);
assert(
  calculateShippingFee("Lahore", 800, 3000) === 280,
  "Major city base shipping under 1kg is Rs. 280"
);
assert(
  calculateShippingFee("Lahore", 2500, 3000) === 520,
  "Extra weight charges for stoneware parcels"
);

// 4. Cash on Delivery (COD) Rules
console.log("\n4. Testing Cash on Delivery (COD) Availability & Limits...");
const cod = new CashOnDeliveryProvider();
assert(cod.isAvailable(15000).available === true, "COD allowed for Rs. 15,000");
assert(
  cod.isAvailable(35000).available === true,
  "COD allowed up to Rs. 35,000 limit"
);
assert(
  cod.isAvailable(40000).available === false,
  "COD blocked above Rs. 35,000 for high-value protection"
);

// 5. Security: Scrypt Password Hashing, Zod Schemas & Rate Limiter
console.log("\n5. Testing Scrypt Hashing, Zod Validation & Rate Limiter...");
const hash = hashPasswordScrypt("KhaakAdmin2026!");
assert(
  verifyPasswordScrypt("KhaakAdmin2026!", hash) === true,
  "Scrypt password verification succeeds for valid password"
);
assert(
  verifyPasswordScrypt("WrongPass", hash) === false,
  "Scrypt password verification rejects invalid password"
);

const invalidProductParse = SaveProductInputSchema.safeParse({
  name: "",
  category_id: "cat-1",
  variants: [],
});
assert(
  invalidProductParse.success === false,
  "Zod schema rejects invalid product payload"
);

const rl1 = checkRateLimit("test-bucket", 2, 10000);
const rl2 = checkRateLimit("test-bucket", 2, 10000);
const rl3 = checkRateLimit("test-bucket", 2, 10000);
assert(
  rl1.allowed && rl2.allowed && !rl3.allowed,
  "Sliding-window rate limiter blocks requests exceeding threshold"
);

// 7. Cloudinary Signed Upload Signing & SQLite Image URL Persistence
console.log("\n7. Testing Cloudinary Signing & SQLite Image URL Persistence...");
const parsedCloud = parseCloudinaryUrl(
  "CLOUDINARY_URL=cloudinary://123456789012345:sampleSecretKey@demo_cloud"
);
assert(
  Boolean(
    parsedCloud &&
      parsedCloud.cloudName === "demo_cloud" &&
      parsedCloud.apiKey === "123456789012345" &&
      parsedCloud.apiSecret === "sampleSecretKey"
  ),
  "Parses CLOUDINARY_URL connection string accurately"
);

const maskedCloud = parseCloudinaryUrl(
  "CLOUDINARY_URL=cloudinary://123456789012345:**********@demo_cloud"
);
assert(
  maskedCloud === null,
  "Rejects masked placeholder CLOUDINARY_URL containing asterisks"
);

const sig = signCloudinaryParams(
  { timestamp: 1700000000, folder: "khaak-khazaf-products" },
  "my_secret"
);
assert(
  sig.length === 40 && /^[0-9a-f]{40}$/.test(sig),
  "Generates valid 40-char SHA-1 signature for signed Cloudinary upload"
);

const optimizedSample = injectCloudinaryAutoOptimize(
  "https://res.cloudinary.com/demo_cloud/image/upload/v1730000000/khaak-khazaf-products/vase.jpg"
);
assert(
  optimizedSample.includes("/image/upload/f_auto,q_auto/"),
  "Injects f_auto,q_auto transformation into Cloudinary delivery URL"
);

console.log("\n🎉 ALL CROCKERY E-COMMERCE & BACKEND TESTS PASSED SUCCESSFULLY!\n");
