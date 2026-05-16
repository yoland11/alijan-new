import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredTables = [
  "orders",
  "shop_orders",
  "shop_order_items",
  "products",
  "service_categories",
  "product_colors",
  "product_gallery_images",
  "reviews",
  "portfolio_items",
  "delivery_settings",
  "settings",
  "profiles",
  "customer_otps",
  "accounts",
  "vouchers",
  "inventory_items",
  "inventory_movements",
  "admin_users",
  "admin_permissions",
];

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
  console.log("أضف رابط قاعدة Supabase في .env ثم شغل: npm run db:check");
  process.exit(0);
}

const client = createClient(databaseUrl);

try {
  await client.connect();
  const result = await client.query(
    `select table_name
     from information_schema.tables
     where table_schema = 'public'
       and table_name = any($1::text[])`,
    [requiredTables],
  );
  const existing = new Set(result.rows.map((row) => row.table_name));
  const missing = requiredTables.filter((table) => !existing.has(table));

  if (missing.length === 0) {
    console.log("كل الجداول المطلوبة موجودة.");
  } else {
    console.log("الجداول الناقصة:");
    for (const table of missing) {
      console.log(`- ${table}`);
    }
    process.exitCode = 1;
  }
} finally {
  await client.end();
}
