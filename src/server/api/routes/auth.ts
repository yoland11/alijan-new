import { Router, type IRouter } from "express";
import {
  adminPermissionsTable,
  adminUsersTable,
  db,
  type AdminUser,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "../lib/auth";
import { hashPassword, verifyPassword } from "../lib/password";
import { PERMISSIONS } from "../lib/permissions";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const defaultAdminUsername = process.env.ADMIN_USERNAME ?? "admin";
const defaultAdminPassword = process.env.ADMIN_PASSWORD ?? "123123";

function ownerPermissions(role: string): string[] {
  return role === "owner" ? [...PERMISSIONS] : [];
}

async function loadPermissions(user: Pick<AdminUser, "id" | "role">): Promise<string[]> {
  if (user.role === "owner") return [...PERMISSIONS];

  const permissions = await db
    .select()
    .from(adminPermissionsTable)
    .where(eq(adminPermissionsTable.userId, user.id));

  return permissions
    .filter((permission) => permission.allowed)
    .map((permission) => permission.permissionKey);
}

function serializeAdminUser(user: AdminUser, permissions: string[]) {
  return {
    id: user.id,
    name: user.fullName,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    permissions,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

async function ensureDefaultAdminUser(): Promise<AdminUser> {
  const passwordHash = await hashPassword(defaultAdminPassword);
  const existing = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, defaultAdminUsername))
    .limit(1);

  if (existing.length > 0) {
    const user = existing[0];
    const updated = await db
      .update(adminUsersTable)
      .set({
        fullName: user.fullName || "المدير الأساسي",
        role: "owner",
        isActive: true,
        passwordHash: user.passwordHash || passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(adminUsersTable.id, user.id))
      .returning();

    for (const permissionKey of PERMISSIONS) {
      await db
        .insert(adminPermissionsTable)
        .values({ userId: user.id, permissionKey, allowed: true })
        .onConflictDoUpdate({
          target: [
            adminPermissionsTable.userId,
            adminPermissionsTable.permissionKey,
          ],
          set: { allowed: true },
        });
    }

    return updated[0];
  }

  const inserted = await db
    .insert(adminUsersTable)
    .values({
      fullName: "المدير الأساسي",
      username: defaultAdminUsername,
      passwordHash,
      role: "owner",
      isActive: true,
    })
    .returning();

  for (const permissionKey of PERMISSIONS) {
    await db
      .insert(adminPermissionsTable)
      .values({ userId: inserted[0].id, permissionKey, allowed: true });
  }

  return inserted[0];
}

router.post("/auth/login", async (req, res) => {
  try {
    const { username: rawUsername, password } = req.body as {
      username?: string;
      password?: string;
    };
    const username = (rawUsername ?? "").trim();

    if (!username || !password) {
      res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      return;
    }

    await ensureDefaultAdminUser();

    const users = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, username))
      .limit(1);

    if (users.length === 0 || !users[0].isActive) {
      res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      return;
    }

    const user = users[0];
    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      return;
    }

    const permissions = await loadPermissions(user);
    const token = createSessionToken(user, permissions);
    setSessionCookie(res, token);

    res.json({ user: serializeAdminUser(user, permissions), token });
  } catch (err) {
    req.log.error({ err }, "login error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const session = req.user;
    if (!session) {
      res.status(401).json({ error: "تسجيل الدخول مطلوب" });
      return;
    }

    const users = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, session.id))
      .limit(1);

    if (users.length === 0 || !users[0].isActive) {
      clearSessionCookie(res);
      res.status(401).json({ error: "تسجيل الدخول مطلوب" });
      return;
    }

    const permissions = await loadPermissions(users[0]);
    res.json(serializeAdminUser(users[0], permissions));
  } catch (err) {
    req.log.error({ err }, "get current admin error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

router.get("/auth/permissions", requireAuth, (_req, res) => {
  res.json({ permissions: PERMISSIONS, ownerPermissions: ownerPermissions("owner") });
});

export default router;
