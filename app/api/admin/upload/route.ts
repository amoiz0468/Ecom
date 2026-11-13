import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getAdminSession } from "@/lib/auth/admin";
import { appendAuditLog } from "@/lib/db/sqlite";
import {
  getCloudinaryConfig,
  listCloudinaryImages,
  uploadBufferToCloudinary,
} from "@/lib/media/cloudinary";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin login required." },
        { status: 401 }
      );
    }

    const cloudConfig = getCloudinaryConfig();
    if (!cloudConfig) {
      return NextResponse.json({
        configured: false,
        cloudName: null,
        resources: [],
      });
    }

    const includeLibrary =
      req.nextUrl.searchParams.get("library") === "1" ||
      req.nextUrl.searchParams.get("library") === "true";

    if (!includeLibrary) {
      return NextResponse.json({
        configured: true,
        cloudName: cloudConfig.cloudName,
        resources: [],
      });
    }

    try {
      const resources = await listCloudinaryImages(24);
      return NextResponse.json({
        configured: true,
        cloudName: cloudConfig.cloudName,
        resources,
      });
    } catch (cloudErr: any) {
      return NextResponse.json({
        configured: true,
        cloudName: cloudConfig.cloudName,
        resources: [],
        warning: cloudErr.message || "Unable to fetch Cloudinary Media Library.",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to inspect media configuration." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin login required to upload images." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const rawFolder = formData.get("folder");
    const safeFolder =
      typeof rawFolder === "string" && /^[a-zA-Z0-9_-]{2,60}$/.test(rawFolder)
        ? rawFolder
        : "almoin-crockery-products";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Unsupported image format. Please upload JPG, PNG, WebP, or AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds 10MB maximum limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Primary Cloud Storage: Signed Server-Side Cloudinary Upload (API Key + Secret)
    const cloudConfig = getCloudinaryConfig();
    if (cloudConfig) {
      const uploaded = await uploadBufferToCloudinary({
        buffer,
        mimeType: file.type,
        fileName: file.name,
        folder: safeFolder,
      });

      appendAuditLog({
        actor: session.username,
        action: "IMAGE_UPLOADED_CLOUDINARY",
        entity_type: "media",
        entity_id: uploaded.publicId || file.name,
        details: `Uploaded image to Cloudinary (${cloudConfig.cloudName}): ${uploaded.url}`,
      });

      return NextResponse.json({
        success: true,
        url: uploaded.url,
        optimizedUrl: uploaded.optimizedUrl,
        publicId: uploaded.publicId,
        cloudName: cloudConfig.cloudName,
        provider: "cloudinary",
      });
    }

    // 2. Fallback Cloud Option: Cloudinary Unsigned Preset (if only preset configured)
    const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const cloudinaryPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
    if (
      cloudinaryCloud &&
      cloudinaryPreset &&
      !cloudinaryCloud.includes("your-") &&
      !cloudinaryCloud.includes("your_")
    ) {
      const cloudForm = new FormData();
      cloudForm.append(
        "file",
        new Blob([new Uint8Array(buffer)], { type: file.type }),
        file.name
      );
      cloudForm.append("upload_preset", cloudinaryPreset);
      cloudForm.append("folder", safeFolder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`,
        { method: "POST", body: cloudForm }
      );

      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          appendAuditLog({
            actor: session.username,
            action: "IMAGE_UPLOADED_CLOUDINARY",
            entity_type: "media",
            entity_id: cloudData.public_id || file.name,
            details: `Uploaded image to Cloudinary CDN: ${cloudData.secure_url}`,
          });
          return NextResponse.json({
            success: true,
            url: cloudData.secure_url,
            provider: "cloudinary",
          });
        }
      }
    }

    // 3. Fallback Cloud Option: ImgBB API
    const imgbbKey = process.env.IMGBB_API_KEY?.trim();
    if (imgbbKey && !imgbbKey.includes("your-")) {
      const imgbbForm = new FormData();
      imgbbForm.append("image", buffer.toString("base64"));

      const imgbbRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`,
        { method: "POST", body: imgbbForm }
      );

      if (imgbbRes.ok) {
        const imgbbData = await imgbbRes.json();
        const remoteUrl = imgbbData?.data?.url;
        if (remoteUrl) {
          appendAuditLog({
            actor: session.username,
            action: "IMAGE_UPLOADED_IMGBB",
            entity_type: "media",
            entity_id: file.name,
            details: `Uploaded image to ImgBB CDN: ${remoteUrl}`,
          });
          return NextResponse.json({
            success: true,
            url: remoteUrl,
            provider: "imgbb",
          });
        }
      }
    }

    // 4. Built-in Local Disk Storage (/public/uploads/products)
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const baseName =
      path
        .basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40) || "product";

    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const fileName = `${baseName}-${uniqueSuffix}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/products/${fileName}`;

    appendAuditLog({
      actor: session.username,
      action: "IMAGE_UPLOADED_LOCAL",
      entity_type: "media",
      entity_id: fileName,
      details: `Saved image locally: ${publicUrl} (${Math.round(
        file.size / 1024
      )} KB)`,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      provider: "local",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to upload product image." },
      { status: 500 }
    );
  }
}
