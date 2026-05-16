import { Router, type IRouter } from "express";
import { db, galleryTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  try {
    const { category } = req.query as Record<string, string>;
    let items;
    if (category) {
      items = await db.select().from(galleryTable).where(eq(galleryTable.category, category)).orderBy(sql`${galleryTable.createdAt} DESC`);
    } else {
      items = await db.select().from(galleryTable).orderBy(sql`${galleryTable.createdAt} DESC`);
    }
    res.json(items.map(g => ({ ...g, createdAt: g.createdAt?.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "list gallery error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/gallery", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(galleryTable).values({
      type: body.type ?? "image",
      url: body.url,
      thumbnailUrl: body.thumbnailUrl ?? null,
      category: body.category,
      titleAr: body.titleAr ?? null,
    }).returning();
    res.status(201).json({ ...inserted[0], createdAt: inserted[0].createdAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "create gallery item error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/gallery/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(galleryTable).where(eq(galleryTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete gallery item error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
