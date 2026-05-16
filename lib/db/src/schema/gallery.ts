import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTypeEnum = pgEnum("gallery_type", ["image", "video"]);

export const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  type: galleryTypeEnum("type").notNull().default("image"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull(),
  titleAr: text("title_ar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({ id: true, createdAt: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof galleryTable.$inferSelect;
