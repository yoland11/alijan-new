import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";

const router: IRouter = Router();
const bucketName = process.env.SUPABASE_SERVICE_UPLOADS_BUCKET ?? "service-requests";

type UploadFilePayload = {
  data: string;
  fieldName?: string;
  name: string;
  serviceType?: string;
  size?: number;
  type?: string;
};

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function sanitizeSegment(value: string): string {
  return value
    .replace(/[^\w\u0600-\u06FF.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "file";
}

function decodeBase64File(data: string): Buffer {
  const base64 = data.includes(",") ? data.split(",").pop() ?? "" : data;
  return Buffer.from(base64, "base64");
}

router.post("/service-uploads", async (req, res) => {
  try {
    const client = getSupabaseAdminClient();
    if (!client) {
      res.status(503).json({ error: "Supabase Storage is not configured" });
      return;
    }

    const files = Array.isArray(req.body?.files) ? req.body.files as UploadFilePayload[] : [];
    if (!files.length) {
      res.json({ files: [] });
      return;
    }

    await client.storage.createBucket(bucketName, { public: false }).catch(() => undefined);

    const uploaded = [];
    for (const file of files) {
      if (!file?.name || !file?.data) continue;

      const buffer = decodeBase64File(file.data);
      const serviceType = sanitizeSegment(file.serviceType ?? "service");
      const fieldName = sanitizeSegment(file.fieldName ?? "attachments");
      const fileName = sanitizeSegment(file.name);
      const path = `${serviceType}/${fieldName}/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;

      const { data, error } = await client.storage
        .from(bucketName)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) throw error;

      const signed = await client.storage
        .from(bucketName)
        .createSignedUrl(data.path, 60 * 60 * 24 * 365);

      uploaded.push({
        bucket: bucketName,
        fieldName: file.fieldName,
        name: file.name,
        path: data.path,
        size: file.size ?? buffer.byteLength,
        type: file.type ?? "application/octet-stream",
        url: signed.data?.signedUrl ?? null,
      });
    }

    res.json({ files: uploaded });
  } catch (err) {
    req.log.error({ err }, "service upload error");
    res.status(500).json({ error: "تعذر رفع الملفات" });
  }
});

export default router;
