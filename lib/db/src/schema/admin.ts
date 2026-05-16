import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminPermissionsTable = pgTable(
  "admin_permissions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUsersTable.id, { onDelete: "cascade" }),
    permissionKey: text("permission_key").notNull(),
    allowed: boolean("allowed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("admin_permissions_user_permission_idx").on(
      table.userId,
      table.permissionKey,
    ),
  ],
);

export const insertAdminUserSchema = createInsertSchema(adminUsersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertAdminPermissionSchema = createInsertSchema(
  adminPermissionsTable,
).omit({ id: true, createdAt: true });

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsersTable.$inferSelect;
export type AdminPermission = typeof adminPermissionsTable.$inferSelect;
