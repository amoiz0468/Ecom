import crypto from "node:crypto";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface CloudinaryUploadResult {
  url: string;
  optimizedUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface CloudinaryAssetItem {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

/**
 * Parses `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`
 * or reads individual `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars.
 */
export function parseCloudinaryUrl(rawUrl?: string): CloudinaryConfig | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim().replace(/^CLOUDINARY_URL=/i, "");
  const match = trimmed.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i);
  if (!match) return null;

  const [, apiKey, apiSecret, cloudName] = match;
  if (!apiKey || !apiSecret || !cloudName || apiSecret.includes("*")) {
    return null;
  }

  return {
    cloudName: cloudName.trim(),
    apiKey: apiKey.trim(),
    apiSecret: apiSecret.trim(),
  };
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes("your_") &&
    !cloudName.includes("your-") &&
    !apiKey.includes("your_") &&
    !apiSecret.includes("your_") &&
    !apiSecret.includes("*")
  ) {
    return { cloudName, apiKey, apiSecret };
  }

  return parseCloudinaryUrl(process.env.CLOUDINARY_URL);
}

/**
 * Generates an official Cloudinary SHA-1 signature for signed upload parameters.
 * Excludes `file`, `cloud_name`, `resource_type`, and `api_key`.
 */
export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const serialized = Object.keys(params)
    .filter(
      (key) =>
        params[key] !== undefined &&
        params[key] !== "" &&
        !["file", "cloud_name", "resource_type", "api_key"].includes(key)
    )
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${serialized}${apiSecret}`, "utf8")
    .digest("hex");
}

export function injectCloudinaryAutoOptimize(secureUrl: string): string {
  if (
    !secureUrl.includes("res.cloudinary.com") ||
    !secureUrl.includes("/image/upload/") ||
    secureUrl.includes("/image/upload/f_auto")
  ) {
    return secureUrl;
  }
  return secureUrl.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto/"
  );
}

/**
 * Uploads an image buffer directly to Cloudinary using a signed server-side request.
 */
export async function uploadBufferToCloudinary(options: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  folder?: string;
}): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const folder = options.folder || "almoin-crockery-products";
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  const signature = signCloudinaryParams(paramsToSign, config.apiSecret);

  const formData = new FormData();
  const uint8 = new Uint8Array(options.buffer);
  formData.append(
    "file",
    new Blob([uint8], { type: options.mimeType }),
    options.fileName
  );
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    config.cloudName
  )}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok || !payload.secure_url) {
    const errMsg =
      payload?.error?.message ||
      `Cloudinary upload failed with HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  return {
    url: payload.secure_url as string,
    optimizedUrl: injectCloudinaryAutoOptimize(payload.secure_url as string),
    publicId: payload.public_id as string,
    width: payload.width,
    height: payload.height,
    format: payload.format,
    bytes: payload.bytes,
  };
}

/**
 * Fetches recent images from the connected Cloudinary Media Library
 * so store admins can reuse existing cloud photos across products/categories.
 */
export async function listCloudinaryImages(
  maxResults = 24
): Promise<CloudinaryAssetItem[]> {
  const config = getCloudinaryConfig();
  if (!config) return [];

  const basicAuth = Buffer.from(
    `${config.apiKey}:${config.apiSecret}`,
    "utf8"
  ).toString("base64");

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
    config.cloudName
  )}/resources/image?max_results=${maxResults}&direction=desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errPayload = await response.json().catch(() => null);
    throw new Error(
      errPayload?.error?.message ||
        `Failed to fetch Cloudinary library (HTTP ${response.status})`
    );
  }

  const data = await response.json();
  const resources = Array.isArray(data?.resources) ? data.resources : [];

  return resources
    .filter((item: any) => Boolean(item?.secure_url))
    .map((item: any) => ({
      publicId: String(item.public_id || ""),
      url: String(item.secure_url),
      format: String(item.format || "jpg"),
      width: Number(item.width || 0),
      height: Number(item.height || 0),
      bytes: Number(item.bytes || 0),
      createdAt: String(item.created_at || ""),
    }));
}

