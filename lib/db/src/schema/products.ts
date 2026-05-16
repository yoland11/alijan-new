import { pgTable, serial, text, numeric, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  descriptionAr: text("description_ar"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric("discount_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  colors: jsonb("colors").$type<{ name: string; hex: string }[]>().default([]),
  inStock: boolean("in_stock").default(true).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  hasCustomization: boolean("has_customization").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
