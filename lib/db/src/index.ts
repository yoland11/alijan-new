import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const missingDatabaseMessage =
  "DATABASE_URL must be set before using database-backed API routes.";

function createMissingDatabaseProxy(): ReturnType<typeof drizzle> {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then") return undefined;
        throw new Error(missingDatabaseMessage);
      },
    },
  ) as ReturnType<typeof drizzle>;
}

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : undefined;

export const db = pool ? drizzle(pool, { schema }) : createMissingDatabaseProxy();

export * from "./schema";
