import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deliveryZonesTable = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  province: text("province").notNull(),
  area: text("area").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days").notNull().default(2),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliveryZoneSchema = createInsertSchema(deliveryZonesTable).omit({ id: true, createdAt: true });
export type InsertDeliveryZone = z.infer<typeof insertDeliveryZoneSchema>;
export type DeliveryZone = typeof deliveryZonesTable.$inferSelect;
