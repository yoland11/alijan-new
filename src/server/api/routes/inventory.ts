import { Router, type IRouter } from "express";
import { db, inventoryTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

function formatItem(i: typeof inventoryTable.$inferSelect) {
  return {
    ...i,
    purchasePrice: parseFloat(i.purchasePrice),
    sellingPrice: parseFloat(i.sellingPrice),
    isLowStock: i.quantity <= i.minQuantity,
    createdAt: i.createdAt?.toISOString(),
  };
}

const router: IRouter = Router();

router.get("/inventory", async (req, res) => {
  try {
    const items = await db.select().from(inventoryTable).orderBy(sql`${inventoryTable.nameAr} ASC`);
    res.json(items.map(formatItem));
  } catch (err) {
    req.log.error({ err }, "list inventory error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(inventoryTable).values({
      nameAr: body.nameAr,
      category: body.category ?? null,
      quantity: body.quantity,
      minQuantity: body.minQuantity ?? 5,
      purchasePrice: String(body.purchasePrice),
      sellingPrice: String(body.sellingPrice),
      unit: body.unit ?? "قطعة",
    }).returning();
    res.status(201).json(formatItem(inserted[0]));
  } catch (err) {
    req.log.error({ err }, "create inventory item error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/inventory/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updates: Record<string, unknown> = {};
    if (body.nameAr !== undefined) updates.nameAr = body.nameAr;
    if (body.category !== undefined) updates.category = body.category;
    if (body.quantity !== undefined) updates.quantity = body.quantity;
    if (body.minQuantity !== undefined) updates.minQuantity = body.minQuantity;
    if (body.purchasePrice !== undefined) updates.purchasePrice = String(body.purchasePrice);
    if (body.sellingPrice !== undefined) updates.sellingPrice = String(body.sellingPrice);
    const updated = await db.update(inventoryTable).set(updates as any).where(eq(inventoryTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "المادة غير موجودة" }); return; }
    res.json(formatItem(updated[0]));
  } catch (err) {
    req.log.error({ err }, "update inventory item error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/inventory/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete inventory item error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
