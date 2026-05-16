import { Router, type IRouter } from "express";
import { db, servicesTable, serviceRequestsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/services", async (req, res) => {
  try {
    const items = await db.select().from(servicesTable).where(eq(servicesTable.isActive, true));
    res.json(items.map(s => ({ ...s, createdAt: s.createdAt?.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "list services error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/services", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(servicesTable).values({
      type: body.type,
      nameAr: body.nameAr,
      descriptionAr: body.descriptionAr ?? null,
      image: body.image ?? null,
      isActive: true,
    }).returning();
    res.status(201).json({ ...inserted[0], createdAt: inserted[0].createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "create service error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/service-requests", async (req, res) => {
  try {
    const { serviceType, status, customerId } = req.query as Record<string, string>;
    const conditions = [];
    if (serviceType) conditions.push(eq(serviceRequestsTable.serviceType, serviceType as any));
    if (status) conditions.push(eq(serviceRequestsTable.status, status as any));
    if (customerId) conditions.push(eq(serviceRequestsTable.customerId, parseInt(customerId)));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(serviceRequestsTable).where(where);
    res.json(items.map(s => ({
      ...s,
      totalAmount: s.totalAmount ? parseFloat(s.totalAmount) : null,
      createdAt: s.createdAt?.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "list service requests error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/service-requests", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(serviceRequestsTable).values({
      serviceType: body.serviceType,
      customerId: body.customerId ?? null,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      status: "pending",
      eventDate: body.eventDate ?? null,
      eventTime: body.eventTime ?? null,
      location: body.location ?? null,
      details: body.details ?? null,
      notes: body.notes ?? null,
    }).returning();
    const s = inserted[0];
    res.status(201).json({ ...s, totalAmount: s.totalAmount ? parseFloat(s.totalAmount) : null, createdAt: s.createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "create service request error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/service-requests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, id)).limit(1);
    if (!items.length) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    const s = items[0];
    res.json({ ...s, totalAmount: s.totalAmount ? parseFloat(s.totalAmount) : null, createdAt: s.createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "get service request error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/service-requests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.totalAmount !== undefined) updates.totalAmount = String(body.totalAmount);
    if (body.eventDate !== undefined) updates.eventDate = body.eventDate;
    if (body.eventTime !== undefined) updates.eventTime = body.eventTime;
    const updated = await db.update(serviceRequestsTable).set(updates as any).where(eq(serviceRequestsTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    const s = updated[0];
    res.json({ ...s, totalAmount: s.totalAmount ? parseFloat(s.totalAmount) : null, createdAt: s.createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "update service request error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
