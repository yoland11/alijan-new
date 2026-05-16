import { Router, type IRouter } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reviews", async (req, res) => {
  try {
    const { productId, status } = req.query as Record<string, string>;
    const conditions = [];
    if (productId) conditions.push(eq(reviewsTable.productId, parseInt(productId)));
    if (status) conditions.push(eq(reviewsTable.status, status as any));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(reviewsTable).where(where).orderBy(sql`${reviewsTable.createdAt} DESC`);
    res.json(items.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "list reviews error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(reviewsTable).values({
      productId: body.productId,
      customerId: body.customerId ?? null,
      customerName: body.customerName,
      rating: body.rating,
      comment: body.comment ?? null,
      images: body.images ?? [],
      status: "pending",
    }).returning();
    res.status(201).json({ ...inserted[0], createdAt: inserted[0].createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "create review error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/reviews/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: "approved" | "rejected" | "pending" };
    const updated = await db.update(reviewsTable).set({ status }).where(eq(reviewsTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "التقييم غير موجود" }); return; }
    res.json({ ...updated[0], createdAt: updated[0].createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "update review error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete review error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
