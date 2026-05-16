import { Router, type IRouter } from "express";
import { db, usersTable, ordersTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/customers", async (req, res) => {
  try {
    const { search } = req.query as Record<string, string>;
    const conditions = [eq(usersTable.role, "customer")];
    if (search) conditions.push(ilike(usersTable.name, `%${search}%`));
    const users = await db.select().from(usersTable).where(and(...conditions));
    const enriched = await Promise.all(users.map(async (u) => {
      const orders = await db.select({ total: sql<number>`COALESCE(SUM(total_amount::numeric), 0)`, count: sql<number>`COUNT(*)` })
        .from(ordersTable).where(eq(ordersTable.customerId, u.id));
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: null,
        totalOrders: Number(orders[0].count),
        totalSpent: Number(orders[0].total),
        createdAt: u.createdAt?.toISOString(),
      };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "list customers error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const users = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!users.length) { res.status(404).json({ error: "الزبون غير موجود" }); return; }
    const u = users[0];
    const orders = await db.select({ total: sql<number>`COALESCE(SUM(total_amount::numeric), 0)`, count: sql<number>`COUNT(*)` })
      .from(ordersTable).where(eq(ordersTable.customerId, u.id));
    res.json({
      id: u.id, name: u.name, phone: u.phone, email: null,
      totalOrders: Number(orders[0].count),
      totalSpent: Number(orders[0].total),
      createdAt: u.createdAt?.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "get customer error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
