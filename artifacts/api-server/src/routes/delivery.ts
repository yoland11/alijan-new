import { Router, type IRouter } from "express";
import { db, deliveryZonesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/delivery/zones", async (req, res) => {
  try {
    const items = await db.select().from(deliveryZonesTable).where(eq(deliveryZonesTable.isActive, true));
    res.json(items.map(z => ({ ...z, price: parseFloat(z.price), createdAt: z.createdAt?.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "list delivery zones error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/delivery/zones", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(deliveryZonesTable).values({
      province: body.province,
      area: body.area,
      price: String(body.price),
      estimatedDays: body.estimatedDays ?? 2,
      isActive: true,
    }).returning();
    const z = inserted[0];
    res.status(201).json({ ...z, price: parseFloat(z.price), createdAt: z.createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "create delivery zone error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
