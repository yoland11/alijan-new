import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  category: text("category"),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(5),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("قطعة"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({ id: true, createdAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventoryTable.$inferSelect;
