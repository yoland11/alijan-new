import { Router, type IRouter } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

function formatTx(t: typeof transactionsTable.$inferSelect) {
  return { ...t, amount: parseFloat(t.amount), createdAt: t.createdAt?.toISOString() };
}

const router: IRouter = Router();

router.get("/accounting/transactions", async (req, res) => {
  try {
    const { type, account, from, to } = req.query as Record<string, string>;
    const conditions = [];
    if (type) conditions.push(eq(transactionsTable.type, type as any));
    if (account) conditions.push(eq(transactionsTable.account, account as any));
    if (from) conditions.push(gte(transactionsTable.date, from));
    if (to) conditions.push(lte(transactionsTable.date, to));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(transactionsTable).where(where).orderBy(sql`${transactionsTable.date} DESC`);
    res.json(items.map(formatTx));
  } catch (err) {
    req.log.error({ err }, "list transactions error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/accounting/transactions", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(transactionsTable).values({
      type: body.type,
      account: body.account,
      toAccount: body.toAccount ?? null,
      amount: String(body.amount),
      description: body.description,
      referenceId: body.referenceId ?? null,
      date: body.date,
    }).returning();
    res.status(201).json(formatTx(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "create transaction error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/accounting/summary", async (req, res) => {
  try {
    const receipts = await db.select({ sum: sql<number>`COALESCE(SUM(amount::numeric), 0)` })
      .from(transactionsTable).where(eq(transactionsTable.type, "receipt"));
    const expenses = await db.select({ sum: sql<number>`COALESCE(SUM(amount::numeric), 0)` })
      .from(transactionsTable).where(eq(transactionsTable.type, "expense"));
    const cashRows = await db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN type='receipt' THEN amount::numeric ELSE -amount::numeric END), 0)` })
      .from(transactionsTable).where(eq(transactionsTable.account, "cash"));
    const bankRows = await db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN type='receipt' THEN amount::numeric ELSE -amount::numeric END), 0)` })
      .from(transactionsTable).where(eq(transactionsTable.account, "bank"));
    const zainRows = await db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN type='receipt' THEN amount::numeric ELSE -amount::numeric END), 0)` })
      .from(transactionsTable).where(eq(transactionsTable.account, "zain_cash"));
    const totalRevenue = Number(receipts[0].sum);
    const totalExpenses = Number(expenses[0].sum);
    res.json({
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      cashBalance: Number(cashRows[0].sum),
      bankBalance: Number(bankRows[0].sum),
      zainCashBalance: Number(zainRows[0].sum),
    });
  } catch (err) {
    req.log.error({ err }, "accounting summary error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
