# Khaak & Khazaf (خاک و خزف) — Luxury Crockery & Tableware E-Commerce (Pakistan)

A production-ready e-commerce platform built specifically for online crockery, dinnerware, and fine ceramics businesses operating in Pakistan.

---

## 🌟 Key Features

- **Pakistani Currency & Pricing**: Whole integer PKR formatting (`Rs. 28,500`) with zero floating-point rounding errors.
- **Pakistani Payment Methods (No Stripe)**:
  - **Cash on Delivery (COD)**: Configurable COD fee (e.g. Rs. 150) and high-value order cap (e.g. Rs. 35,000 max) to prevent fake orders and courier liability.
  - **Manual Bank Transfer / JazzCash / Easypaisa**: Display IBAN, bank title, and mobile wallet details with customer payment-proof screenshot upload and 1-click admin approval.
  - **Online Gateway (Safepay Sandbox API v2 / PayFast)**: Modular payment provider abstraction with HMAC-SHA256 webhook signature verification.
- **Fragile-Goods Protection & Unboxing Policy**:
  - Optional heavy-duty air-column & double-wall safety packaging add-on (+Rs. 250).
  - Prominent 100% Free Transit Breakage Guarantee requiring a 30-second unboxing video.
  - Dimensional & volumetric weight calculation: `max(actual_weight, (L*W*H)/5000)`.
- **Nationwide Logistics & Courier Slips**:
  - Pre-integrated tracking URLs for **TCS, Leopards Courier, PostEx, and Trax Logistics**.
  - Printable A4 & thermal courier packing slip with prominent fragile warnings and COD cash collection banner.
- **Instant WhatsApp Deep Links**: Floating concierge button and 1-click post-order WhatsApp confirmation link.
- **Guest-First Checkout**: Zero friction checkout with strict Pakistani phone validation (`+92 / 03xx-xxxxxxx`) and city zone shipping.
- **Admin Portal (`/admin`)**:
  - Real-time KPI dashboard (revenue, total orders, COD outstanding, pending proofs, low-stock alerts).
  - Order management with status workflow (`pending` → `confirmed` → `packed` → `shipped` → `delivered`).
  - Catalog inventory matrix with CSV export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui design tokens
- **Database & Auth**: Supabase (PostgreSQL with RLS, atomic stock locking functions, and Storage buckets)
- **State & Forms**: Zustand (persisted cart), React Hook Form, Zod
- **Transactional Communications**: Resend + WhatsApp Business click-to-chat
- **Deployment**: Vercel

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/amoiz0468/Ecom.git
cd Ecom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the template file to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
RESEND_API_KEY=re_xxxxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=+923001234567
```

### 4. Run automated tests
```bash
npm test
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database & Migrations Setup

1. Create a new Supabase project at [database.new](https://database.new).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the migrations in sequential order:
   - Run `supabase/migrations/001_initial_schema.sql` (Creates custom types, tables, and full-text search indexes).
   - Run `supabase/migrations/002_rls_and_triggers.sql` (Enables RLS, security policies, atomic `reserve_order_stock` and `restore_order_stock` stored procedures).
   - Run `supabase/seed.sql` (Populates 30+ realistic luxury dinnerware products, shipping zones, and categories).
4. Go to **Storage** and create a public bucket named `payment-proofs`.

---

## 💳 Payment Gateway Sandbox Setup (Safepay)

1. Sign up for a Safepay sandbox developer account at [https://sandbox.getsafepay.com](https://sandbox.getsafepay.com).
2. Generate your Sandbox API Key and Secret Key in the Merchant Portal.
3. Add the credentials to `.env.local`:
   ```env
   PAYMENT_GATEWAY_PROVIDER=safepay
   SAFEPAY_API_KEY=sec_sand_xxxxxxx
   SAFEPAY_SECRET_KEY=sand_shared_secret_xxxxxxx
   SAFEPAY_ENV=sandbox
   ```
4. Set the Webhook URL in your Safepay dashboard to:  
   `https://your-domain.vercel.app/api/webhooks/payment/safepay`

---

## 📦 Deployment to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Production release"
   git push origin main
   ```
2. Import the project into [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, copy the values from your `.env.local`.
4. Deploy! Next.js will automatically build all static pages, sitemaps, and API routes.

---

## 📋 Final Manual Production Checklist

- [ ] **Supabase**: Verify RLS policies are active and the `payment-proofs` storage bucket is set up.
- [ ] **Bank & Wallet Details**: Update `NEXT_PUBLIC_BANK_IBAN`, `NEXT_PUBLIC_JAZZCASH_NUMBER`, and `NEXT_PUBLIC_EASYPAISA_NUMBER` in production env variables.
- [ ] **WhatsApp Business**: Confirm `NEXT_PUBLIC_WHATSAPP_NUMBER` is active on WhatsApp with an automated greeting message.
- [ ] **Couriers**: Open merchant corporate COD accounts with TCS, Leopards, PostEx, or Trax.
- [ ] **Resend**: Verify domain DNS records (DKIM, SPF) on Resend to ensure receipts land in the inbox.
- [ ] **Custom Domain**: Connect your `.pk` or `.com` domain in Vercel.
- [ ] **Packaging Supplies**: Procure double-wall 7-ply cartons, air-column wrap, and fragile warning tape for the warehouse.
