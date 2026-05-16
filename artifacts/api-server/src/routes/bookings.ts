import { Router, type IRouter } from "express";
import { db, bookingsTable } from "@workspace/db";
import { eq, and, like, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/bookings", async (req, res) => {
  try {
    const { month, status } = req.query as Record<string, string>;
    const conditions = [];
    if (status) conditions.push(eq(bookingsTable.status, status as any));
    if (month) conditions.push(like(bookingsTable.date, `${month}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(bookingsTable).where(where).orderBy(sql`${bookingsTable.date} ASC`);
    res.json(items.map(b => ({ ...b, createdAt: b.createdAt?.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "list bookings error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    const body = req.body;
    const colors = ["#c9a84c", "#d4af37", "#b8972a", "#a67c00", "#8b6914"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const inserted = await db.insert(bookingsTable).values({
      title: body.title,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      serviceType: body.serviceType ?? null,
      date: body.date,
      time: body.time ?? null,
      status: "confirmed",
      color,
      notes: body.notes ?? null,
    }).returning();
    res.status(201).json({ ...inserted[0], createdAt: inserted[0].createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "create booking error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/bookings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.date !== undefined) updates.date = body.date;
    if (body.time !== undefined) updates.time = body.time;
    const updated = await db.update(bookingsTable).set(updates as any).where(eq(bookingsTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "الحجز غير موجود" }); return; }
    res.json({ ...updated[0], createdAt: updated[0].createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "update booking error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
