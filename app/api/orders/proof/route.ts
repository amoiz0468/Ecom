import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { OrderRepository } from "@/lib/db/repositories";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  getCloudinaryConfig,
  uploadBufferToCloudinary,
} from "@/lib/media/cloudinary";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_PROOF_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rate = checkRateLimit(`order-proof:${ip}`, 10, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many upload attempts. Please wait ${rate.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const orderId = formData.get("orderId");
    const phone = formData.get("phone");
    const file = formData.get("file");

    if (typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    if (typeof phone !== "string" || phone.replace(/\D/g, "").length < 7) {
      return NextResponse.json(
        { error: "Customer phone verification is required." },
        { status: 403 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a receipt screenshot image." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, or WebP screenshot." },
        { status: 400 }
      );
    }

    if (file.size > MAX_PROOF_BYTES) {
      return NextResponse.json(
        { error: "Screenshot must be under 8MB." },
        { status: 400 }
      );
    }

    const existingOrder = await OrderRepository.getOrderByIdOrNumber(orderId.trim());
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const providedDigits = phone.replace(/\D/g, "").slice(-10);
    const guestDigits = (existingOrder.guest_info?.phone || "").replace(/\D/g, "").slice(-10);
    const shippingDigits = (existingOrder.shipping_address?.phone || "").replace(/\D/g, "").slice(-10);
    if (
      !providedDigits ||
      (providedDigits !== guestDigits && providedDigits !== shippingDigits)
    ) {
      return NextResponse.json(
        { error: "Phone number does not match this order." },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let proofUrl = "";

    const cloudConfig = getCloudinaryConfig();
    if (cloudConfig) {
      const uploaded = await uploadBufferToCloudinary({
        buffer,
        mimeType: file.type,
        fileName: file.name,
        folder: "almoin-crockery-payment-proofs",
      });
      proofUrl = uploaded.url;
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Image storage is not configured on the server." },
        { status: 500 }
      );
    } else {
      const proofsDir = path.join(process.cwd(), "public", "uploads", "proofs");
      if (!fs.existsSync(proofsDir)) {
        fs.mkdirSync(proofsDir, { recursive: true });
      }
      const fileName = `proof-${existingOrder.order_number.toLowerCase()}-${Date.now()}-${crypto
        .randomBytes(2)
        .toString("hex")}.${ext}`;
      fs.writeFileSync(path.join(proofsDir, fileName), buffer);
      proofUrl = `/uploads/proofs/${fileName}`;
    }

    const updatedOrder = await OrderRepository.attachPaymentProof(
      existingOrder.id,
      proofUrl
    );

    return NextResponse.json({
      success: true,
      url: proofUrl,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to upload payment receipt." },
      { status: 500 }
    );
  }
}

