import { Router, type IRouter } from "express";
import { adminPermissionsTable, adminUsersTable, db, type AdminUser } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/password";
import { normalizePermissions } from "../lib/permissions";

const router: IRouter = Router();

function canChangeProtectedUser(user: AdminUser): boolean {
  return !(user.username === "admin" && user.role === "owner");
}

async function replacePermissions(userId: number, permissions: string[]): Promise<void> {
  await db
    .delete(adminPermissionsTable)
    .where(eq(adminPermissionsTable.userId, userId));

  for (const permissionKey of permissions) {
    await db
      .insert(adminPermissionsTable)
      .values({ userId, permissionKey, allowed: true });
  }
}

async function serializeEmployee(user: AdminUser) {
  const permissions = await db
    .select()
    .from(adminPermissionsTable)
    .where(eq(adminPermissionsTable.userId, user.id));

  return {
    id: user.id,
    name: user.fullName,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    permissions: user.role === "owner"
      ? permissions.map((permission) => permission.permissionKey)
      : permissions
          .filter((permission) => permission.allowed)
          .map((permission) => permission.permissionKey),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

router.get("/employees", async (req, res) => {
  try {
    const items = await db.select().from(adminUsersTable);
    res.json(await Promise.all(items.map(serializeEmployee)));
  } catch (err) {
    req.log.error({ err }, "list employees error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/employees", async (req, res) => {
  try {
    const body = req.body;
    const permissions = normalizePermissions(body.permissions);

    if (!body.fullName && !body.name) {
      res.status(400).json({ error: "اسم الموظف مطلوب" });
      return;
    }

    if (!body.username || !body.password) {
      res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      return;
    }

    const passwordHash = await hashPassword(body.password);
    const inserted = await db
      .insert(adminUsersTable)
      .values({
        fullName: body.fullName ?? body.name,
        username: body.username,
        role: body.role ?? "staff",
        isActive: body.isActive ?? true,
        passwordHash,
      })
      .returning();

    await replacePermissions(inserted[0].id, permissions);

    res.status(201).json(await serializeEmployee(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "create employee error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/employees/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const users = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, id))
      .limit(1);

    if (users.length === 0) {
      res.status(404).json({ error: "الموظف غير موجود" });
      return;
    }

    const user = users[0];
    const body = req.body;
    const updates: Partial<typeof adminUsersTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.fullName !== undefined || body.name !== undefined) {
      updates.fullName = body.fullName ?? body.name;
    }
    if (body.username !== undefined && canChangeProtectedUser(user)) {
      updates.username = body.username;
    }
    if (body.role !== undefined && canChangeProtectedUser(user)) {
      updates.role = body.role;
    }
    if (body.isActive !== undefined) {
      if (!canChangeProtectedUser(user) && body.isActive === false) {
        res.status(400).json({ error: "لا يمكن تعطيل المدير الأساسي" });
        return;
      }
      updates.isActive = Boolean(body.isActive);
    }
    if (body.password) {
      updates.passwordHash = await hashPassword(body.password);
    }

    const updated = await db
      .update(adminUsersTable)
      .set(updates)
      .where(eq(adminUsersTable.id, id))
      .returning();

    if (Array.isArray(body.permissions)) {
      if (!canChangeProtectedUser(user)) {
        res.status(400).json({ error: "لا يمكن إزالة صلاحيات المدير الأساسي" });
        return;
      }
      await replacePermissions(id, normalizePermissions(body.permissions));
    }

    res.json(await serializeEmployee(updated[0]));
  } catch (err) {
    req.log.error({ err }, "update employee error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/employees/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const users = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, id))
      .limit(1);

    if (users.length === 0) {
      res.status(404).json({ error: "الموظف غير موجود" });
      return;
    }

    if (!canChangeProtectedUser(users[0])) {
      res.status(400).json({ error: "لا يمكن حذف المدير الأساسي" });
      return;
    }

    await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete employee error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
