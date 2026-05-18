import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

function generateTrackingCode(): string {
  return "AJN" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    subtotal: parseFloat(String(o.subtotal)),
    deliveryFee: parseFloat(String(o.deliveryFee ?? "0")),
    totalAmount: parseFloat(String(o.totalAmount)),
    createdAt: o.createdAt?.toISOString(),
    updatedAt: o.updatedAt?.toISOString(),
  };
}

const router: IRouter = Router();

router.get("/orders", async (req, res) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const conditions = [];
    if (status) conditions.push(eq(ordersTable.status, status as any));
    if (customerId) conditions.push(eq(ordersTable.customerId, parseInt(customerId)));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(ordersTable).where(where).orderBy(sql`${ordersTable.createdAt} DESC`);
    res.json(items.map(formatOrder));
  } catch (err) {
    req.log.error({ err }, "list orders error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const body = req.body;
    const trackingCode = generateTrackingCode();
    const subtotal = (body.items ?? []).reduce((acc: number, i: any) => acc + i.unitPrice * i.quantity, 0);
    const inserted = await db.insert(ordersTable).values({
      trackingCode,
      customerId: body.customerId ?? null,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      status: "pending",
      items: body.items ?? [],
      subtotal: String(subtotal),
      deliveryFee: String(body.deliveryFee ?? 0),
      totalAmount: String(body.totalAmount),
      deliveryZoneId: body.deliveryZoneId ?? null,
      deliveryAddress: body.deliveryAddress ?? null,
      notes: body.notes ?? null,
    }).returning();
    res.status(201).json(formatOrder(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "create order error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/orders/track/:trackingCode", async (req, res) => {
  try {
    const items = await db.select().from(ordersTable).where(eq(ordersTable.trackingCode, req.params.trackingCode)).limit(1);
    if (!items.length) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json(formatOrder(items[0]));
  } catch (err) {
    req.log.error({ err }, "track order error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!items.length) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json(formatOrder(items[0]));
  } catch (err) {
    req.log.error({ err }, "get order error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.deliveryAgentId !== undefined) updates.deliveryAgentId = body.deliveryAgentId;
    if (body.notes !== undefined) updates.notes = body.notes;
    const updated = await db.update(ordersTable).set(updates as any).where(eq(ordersTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json(formatOrder(updated[0]));
  } catch (err) {
    req.log.error({ err }, "update order error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
