import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "supabase", "seed.sql");

function loadDotEnv() {
  return readFile(path.join(root, ".env"), "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const [key, ...rest] = trimmed.split("=");
        process.env[key] ??= rest.join("=").replace(/^["']|["']$/g, "");
      }
    })
    .catch(() => {});
}

function getDatabaseUrl() {
  return process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
}

function createClient(connectionString) {
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  return new Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

await loadDotEnv();

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.log("لم يتم العثور على SUPABASE_DB_URL أو DATABASE_URL.");
  console.log("أضف رابط قاعدة Supabase في .env ثم شغل: npm run db:seed");
  console.log(`أو شغل محتوى الملف يدويًا من Supabase SQL Editor: ${seedPath}`);
  process.exit(0);
}

const sql = await readFile(seedPath, "utf8");
const client = createClient(databaseUrl);

try {
  await client.connect();
  await client.query(sql);
  console.log("تمت إضافة seed البيانات الأولية بنجاح.");
} finally {
  await client.end();
}
