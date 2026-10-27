import { formatPKR, normalizePakistaniPhone } from "../lib/utils";
import { calculateShippingFee } from "../lib/orders";
import { CashOnDeliveryProvider } from "../lib/payments/cod";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log("\n--- RUNNING CROCKERY BUSINESS LOGIC TESTS ---\n");

// 1. PKR Currency Formatting
console.log("1. Testing PKR Currency Formatter...");
assert(formatPKR(4500) === "Rs. 4,500", "4500 formatted to 'Rs. 4,500'");
assert(formatPKR(28500) === "Rs. 28,500", "28500 formatted to 'Rs. 28,500'");
assert(formatPKR(0) === "Rs. 0", "0 formatted to 'Rs. 0'");

// 2. Pakistani Phone Number Validation & Normalization
console.log("\n2. Testing Pakistani Phone Normalization...");
const p1 = normalizePakistaniPhone("03001234567");
assert(p1.isValid && p1.display === "0300-1234567" && p1.normalized === "+923001234567", "Normalizes 03001234567");

const p2 = normalizePakistaniPhone("+923451234567");
assert(p2.isValid && p2.display === "0345-1234567", "Normalizes +923451234567");

const p3 = normalizePakistaniPhone("0312-9876543");
assert(p3.isValid && p3.display === "0312-9876543", "Normalizes hyphenated 0312-9876543");

const pInvalid = normalizePakistaniPhone("12345");
assert(!pInvalid.isValid, "Rejects invalid short numbers");

// 3. Shipping Fee Calculations
console.log("\n3. Testing Pakistani Shipping Rates by Zone & Weight...");
// Free shipping over 5000 PKR
assert(calculateShippingFee("Lahore", 2000, 5200) === 0, "Free delivery for orders >= Rs. 5,000");
assert(calculateShippingFee("Karachi", 12000, 28500) === 0, "Free delivery on heavy dinner set over threshold");

// Under threshold
assert(calculateShippingFee("Karachi", 800, 3000) === 200, "Karachi base shipping under 1kg is Rs. 200");
assert(calculateShippingFee("Lahore", 800, 3000) === 280, "Major city base shipping under 1kg is Rs. 280");
// Extra weight: 2500g in Lahore (1kg base + 2kg extra @ 120) = 280 + 240 = 520
assert(calculateShippingFee("Lahore", 2500, 3000) === 520, "Extra weight charges for stoneware parcels");

// 4. Cash on Delivery (COD) Rules
console.log("\n4. Testing Cash on Delivery (COD) Availability & Limits...");
const cod = new CashOnDeliveryProvider();
assert(cod.isAvailable(15000).available === true, "COD allowed for Rs. 15,000");
assert(cod.isAvailable(35000).available === true, "COD allowed up to Rs. 35,000 limit");
assert(cod.isAvailable(40000).available === false, "COD blocked above Rs. 35,000 for high-value protection");

console.log("\n🎉 ALL CROCKERY E-COMMERCE TESTS PASSED SUCCESSFULLY!\n");
