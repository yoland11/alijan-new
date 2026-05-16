import { pgTable, serial, text, numeric, integer, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  trackingCode: text("tracking_code").notNull().unique(),
  customerId: integer("customer_id").references(() => usersTable.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  items: jsonb("items").$type<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    color?: string;
    customization?: string;
  }[]>().default([]),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryZoneId: integer("delivery_zone_id"),
  deliveryZone: text("delivery_zone"),
  deliveryAddress: text("delivery_address"),
  deliveryAgentId: integer("delivery_agent_id").references(() => usersTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
