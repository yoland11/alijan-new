import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";

const router: IRouter = Router();

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const DEFAULT_BUCKET = "product-images";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage credentials are missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function parseImageDataUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const match = /^data:([^;]+);base64,(.+)$/i.exec(value);
  if (!match) return null;

  const mimeType = match[1].toLowerCase();
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");

  return { mimeType, buffer };
}

function sanitizeFileName(value: unknown) {
  const original = typeof value === "string" ? value : "product-image";
  const withoutExt = original.replace(/\.[^.]+$/, "");
  const normalized = withoutExt
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return normalized || "product-image";
}

async function ensurePublicBucket(bucketName: string) {
  const supabase = getSupabaseAdmin();
  const { data: bucket, error } = await supabase.storage.getBucket(bucketName);

  if (!bucket && error) {
    const created = await supabase.storage.createBucket(bucketName, { public: true });
    if (created.error && !/already exists/i.test(created.error.message)) {
      throw created.error;
    }
    return supabase;
  }

  if (bucket && !bucket.public) {
    const updated = await supabase.storage.updateBucket(bucketName, { public: true });
    if (updated.error) throw updated.error;
  }

  return supabase;
}

router.post("/uploads/product-image", async (req, res) => {
  try {
    const parsed = parseImageDataUrl(req.body?.dataUrl);
    const declaredContentType =
      typeof req.body?.contentType === "string" ? req.body.contentType.toLowerCase() : "";

    if (!parsed) {
      res.status(400).json({ error: "صيغة الصورة غير صحيحة" });
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(parsed.mimeType) || parsed.mimeType !== declaredContentType) {
      res.status(400).json({ error: "نوع الصورة غير مدعوم" });
      return;
    }

    if (parsed.buffer.length > MAX_IMAGE_BYTES) {
      res.status(400).json({ error: "حجم الصورة أكبر من 8MB" });
      return;
    }

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
    const supabase = await ensurePublicBucket(bucketName);
    const extension = IMAGE_EXTENSIONS[parsed.mimeType] ?? ".jpg";
    const safeName = sanitizeFileName(req.body?.fileName);
    const today = new Date().toISOString().slice(0, 10);
    const storagePath = `products/${today}/${Date.now()}-${randomUUID()}-${safeName}${extension}`;

    const upload = await supabase.storage
      .from(bucketName)
      .upload(storagePath, parsed.buffer, {
        cacheControl: "31536000",
        contentType: parsed.mimeType,
        upsert: false,
      });

    if (upload.error) throw upload.error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    res.status(201).json({ url: data.publicUrl, path: storagePath });
  } catch (err) {
    req.log.error({ err }, "upload product image error");
    res.status(500).json({ error: "تعذر رفع الصورة" });
  }
});

export default router;
