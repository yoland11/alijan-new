import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable, inventoryTable, serviceRequestsTable, transactionsTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [totalOrdersRes, totalRevenueRes, pendingOrdersRes, totalCustomersRes,
      totalProductsRes, todayOrdersRes, pendingServiceRes, lowStockRes, monthlyRevenueRes] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(ordersTable),
      db.select({ sum: sql<number>`COALESCE(SUM(total_amount::numeric), 0)` }).from(ordersTable).where(eq(ordersTable.status, "delivered")),
      db.select({ count: sql<number>`COUNT(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
      db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(eq(usersTable.role, "customer")),
      db.select({ count: sql<number>`COUNT(*)` }).from(productsTable),
      db.select({ count: sql<number>`COUNT(*)` }).from(ordersTable).where(sql`DATE(created_at) = ${today}`),
      db.select({ count: sql<number>`COUNT(*)` }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "pending")),
      db.select({ count: sql<number>`COUNT(*)` }).from(inventoryTable).where(sql`quantity <= min_quantity`),
      db.select({ sum: sql<number>`COALESCE(SUM(total_amount::numeric), 0)` }).from(ordersTable).where(sql`DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`),
    ]);

    const ordersByStatusRes = await db.select({
      status: ordersTable.status,
      count: sql<number>`COUNT(*)`,
    }).from(ordersTable).groupBy(ordersTable.status);

    res.json({
      totalOrders: Number(totalOrdersRes[0].count),
      totalRevenue: Number(totalRevenueRes[0].sum),
      pendingOrders: Number(pendingOrdersRes[0].count),
      totalCustomers: Number(totalCustomersRes[0].count),
      totalProducts: Number(totalProductsRes[0].count),
      lowStockItems: Number(lowStockRes[0].count),
      todayOrders: Number(todayOrdersRes[0].count),
      pendingServiceRequests: Number(pendingServiceRes[0].count),
      monthlyRevenue: Number(monthlyRevenueRes[0].sum),
      ordersByStatus: ordersByStatusRes.map(r => ({ status: r.status, count: Number(r.count) })),
    });
  } catch (err) {
    req.log.error({ err }, "dashboard stats error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/dashboard/recent-orders", async (req, res) => {
  try {
    const items = await db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} DESC`).limit(10);
    res.json(items.map(o => ({
      ...o,
      subtotal: parseFloat(String(o.subtotal)),
      deliveryFee: parseFloat(String(o.deliveryFee ?? "0")),
      totalAmount: parseFloat(String(o.totalAmount)),
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "recent orders error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/dashboard/revenue-chart", async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleString("ar-IQ", { month: "long", year: "numeric" });

      const [revenueRes, expensesRes] = await Promise.all([
        db.select({ sum: sql<number>`COALESCE(SUM(total_amount::numeric), 0)` })
          .from(ordersTable).where(sql`TO_CHAR(created_at, 'YYYY-MM') = ${yearMonth}`),
        db.select({ sum: sql<number>`COALESCE(SUM(amount::numeric), 0)` })
          .from(transactionsTable).where(sql`TO_CHAR(created_at, 'YYYY-MM') = ${yearMonth} AND type = 'expense'`),
      ]);

      months.push({
        month: monthLabel,
        revenue: Number(revenueRes[0].sum),
        expenses: Number(expensesRes[0].sum),
      });
    }
    res.json(months);
  } catch (err) {
    req.log.error({ err }, "revenue chart error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
