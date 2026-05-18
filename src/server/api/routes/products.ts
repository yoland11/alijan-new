import { Router, type IRouter } from "express";
import { db, productsTable, reviewsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (category) conditions.push(eq(productsTable.category, category));
    if (search) conditions.push(ilike(productsTable.nameAr, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(productsTable).where(where).limit(limitNum).offset(offset);
    const total = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where);

    const enriched = await Promise.all(items.map(async (p) => {
      const reviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable)
        .where(and(eq(reviewsTable.productId, p.id), eq(reviewsTable.status, "approved")));
      const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null;
      return {
        ...p,
        price: parseFloat(p.price),
        discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null,
        averageRating: avgRating,
        reviewCount: reviews.length,
      };
    }));

    res.json({ items: enriched, total: Number(total[0].count), page: pageNum, limit: limitNum });
  } catch (err) {
    req.log.error({ err }, "list products error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = req.body;
    const inserted = await db.insert(productsTable).values({
      nameAr: body.nameAr,
      nameEn: body.nameEn ?? null,
      descriptionAr: body.descriptionAr ?? null,
      price: String(body.price),
      discountPrice: body.discountPrice ? String(body.discountPrice) : null,
      category: body.category,
      images: body.images ?? [],
      colors: body.colors ?? [],
      inStock: body.stockQuantity > 0,
      stockQuantity: body.stockQuantity ?? 0,
      hasCustomization: body.hasCustomization ?? false,
    }).returning();
    const p = inserted[0];
    res.status(201).json({ ...p, price: parseFloat(p.price), discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null, averageRating: null, reviewCount: 0 });
  } catch (err) {
    req.log.error({ err }, "create product error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const items = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!items.length) { res.status(404).json({ error: "المنتج غير موجود" }); return; }
    const p = items[0];
    const reviews = await db.select({ rating: reviewsTable.rating }).from(reviewsTable)
      .where(and(eq(reviewsTable.productId, p.id), eq(reviewsTable.status, "approved")));
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : null;
    res.json({ ...p, price: parseFloat(p.price), discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null, averageRating: avgRating, reviewCount: reviews.length });
  } catch (err) {
    req.log.error({ err }, "get product error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updates: Record<string, unknown> = {};
    if (body.nameAr !== undefined) updates.nameAr = body.nameAr;
    if (body.nameEn !== undefined) updates.nameEn = body.nameEn;
    if (body.descriptionAr !== undefined) updates.descriptionAr = body.descriptionAr;
    if (body.price !== undefined) updates.price = String(body.price);
    if (body.discountPrice !== undefined) updates.discountPrice = body.discountPrice ? String(body.discountPrice) : null;
    if (body.category !== undefined) updates.category = body.category;
    if (body.images !== undefined) updates.images = body.images;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.stockQuantity !== undefined) { updates.stockQuantity = body.stockQuantity; updates.inStock = body.stockQuantity > 0; }
    if (body.inStock !== undefined) updates.inStock = body.inStock;
    if (body.hasCustomization !== undefined) updates.hasCustomization = body.hasCustomization;
    const updated = await db.update(productsTable).set(updates as any).where(eq(productsTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "المنتج غير موجود" }); return; }
    const p = updated[0];
    res.json({ ...p, price: parseFloat(p.price), discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null, averageRating: null, reviewCount: 0 });
  } catch (err) {
    req.log.error({ err }, "update product error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "delete product error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
