import { pgTable, serial, text, boolean, timestamp, pgEnum, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const serviceTypeEnum = pgEnum("service_type", ["koshat", "photography", "albums", "graduation", "research", "distributions", "gifts"]);
export const serviceRequestStatusEnum = pgEnum("service_request_status", ["pending", "booked", "in_progress", "editing", "ready", "delivered", "cancelled"]);

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  type: serviceTypeEnum("type").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionAr: text("description_ar"),
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRequestsTable = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  customerId: integer("customer_id").references(() => usersTable.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  status: serviceRequestStatusEnum("status").notNull().default("pending"),
  eventDate: text("event_date"),
  eventTime: text("event_time"),
  location: text("location"),
  details: jsonb("details").$type<Record<string, unknown> | null>().default({}),
  notes: text("notes"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true, createdAt: true });
export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({ id: true, createdAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type Service = typeof servicesTable.$inferSelect;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
