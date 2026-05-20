import { motion } from "framer-motion";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, ShoppingBag, Pencil, X, ImagePlus, Loader2 } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  normalizeProductColors,
  PRODUCT_COLOR_LIBRARY,
  productColorKey,
  type ProductColorOption,
} from "@/lib/product-colors";

type ProductForm = {
  nameAr: string;
  category: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  descriptionAr: string;
  images: string;
  colors: ProductColorOption[];
};

const emptyForm: ProductForm = {
  nameAr: "",
  category: "",
  price: "",
  discountPrice: "",
  stockQuantity: "0",
  descriptionAr: "",
  images: "",
  colors: [],
};

function parseImageUrls(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((image) => image.trim())
    .filter(Boolean);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("تعذر قراءة الصورة"));
    };
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const { data: products, isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const safeProductItems = toSafeArray<any>(products);
  const formImageUrls = parseImageUrls(form.images);

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const updateField = (key: Exclude<keyof ProductForm, "colors">, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleColor = (color: ProductColorOption) => {
    setForm((current) => {
      const exists = current.colors.some((item) => productColorKey(item) === productColorKey(color));
      return {
        ...current,
        colors: exists
          ? current.colors.filter((item) => productColorKey(item) !== productColorKey(color))
          : [...current.colors, color],
      };
    });
  };

  const removeColor = (color: ProductColorOption) => {
    setForm((current) => ({
      ...current,
      colors: current.colors.filter((item) => productColorKey(item) !== productColorKey(color)),
    }));
  };

  const removeImage = (imageUrl: string) => {
    setForm((current) => ({
      ...current,
      images: parseImageUrls(current.images)
        .filter((image) => image !== imageUrl)
        .join("\n"),
    }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("يرجى اختيار ملف صورة فقط");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setImageUploadError("حجم الصورة يجب أن لا يتجاوز 8MB");
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch("/api/uploads/product-image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          dataUrl,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "تعذر رفع الصورة");
      }

      setForm((current) => ({
        ...current,
        images: [...parseImageUrls(current.images), result.url].join("\n"),
      }));
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : "تعذر رفع الصورة");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setImageUploadError(null);
    setIsUploadingImage(false);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setImageUploadError(null);
    setShowForm(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      nameAr: product?.nameAr ?? "",
      category: product?.category ?? "",
      price: String(product?.price ?? ""),
      discountPrice: product?.discountPrice ? String(product.discountPrice) : "",
      stockQuantity: String(product?.stockQuantity ?? 0),
      descriptionAr: product?.descriptionAr ?? "",
      images: toSafeArray<string>(product?.images).join("\n"),
      colors: normalizeProductColors(product?.colors),
    });
    setImageUploadError(null);
    setShowForm(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      nameAr: form.nameAr.trim(),
      category: form.category.trim() || "general",
      price: Number(form.price || 0),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stockQuantity: Number(form.stockQuantity || 0),
      descriptionAr: form.descriptionAr.trim() || undefined,
      images: formImageUrls,
      colors: form.colors,
    };

    const onSuccess = () => {
      invalidateProducts();
      closeForm();
    };

    if (editingProduct?.id) {
      updateProduct.mutate(
        { id: Number(editingProduct.id), data: payload },
        { onSuccess },
      );
      return;
    }

    createProduct.mutate({ data: payload }, { onSuccess });
  };

  const handleDelete = (id: number) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    deleteProduct.mutate({ id }, { onSuccess: invalidateProducts });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-primary"
        >
          إدارة المنتجات
        </motion.h1>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          منتج جديد
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-sm text-muted-foreground">اسم المنتج</label>
            <input
              required
              value={form.nameAr}
              onChange={(event) => updateField("nameAr", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">التصنيف</label>
            <input
              required
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">السعر</label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">سعر التخفيض</label>
            <input
              type="number"
              min="0"
              value={form.discountPrice}
              onChange={(event) => updateField("discountPrice", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">الكمية</label>
            <input
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(event) => updateField("stockQuantity", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2 rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-primary">صور المنتج</h2>
                <p className="text-xs text-muted-foreground">ارفع صورة من جهازك أو أضف رابط صورة لكل سطر.</p>
              </div>

              <label
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 ${
                  isUploadingImage ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {isUploadingImage ? "جاري رفع الصورة..." : "رفع صورة"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="sr-only"
                />
              </label>
            </div>

            <textarea
              value={form.images}
              onChange={(event) => updateField("images", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary min-h-24"
              placeholder="رابط صورة لكل سطر"
            />

            {imageUploadError && (
              <p className="mt-2 text-sm text-destructive">{imageUploadError}</p>
            )}

            {formImageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {formImageUrls.map((imageUrl) => (
                  <div key={imageUrl} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={imageUrl}
                      alt="صورة المنتج"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imageUrl)}
                      className="absolute left-2 top-2 rounded-full bg-background/85 p-1.5 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="حذف الصورة"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-base font-bold text-primary">ألوان المنتج</h2>
              <p className="text-xs text-muted-foreground">
                اختر لوناً أو أكثر من القائمة الثابتة. إذا لم تختر أي لون لن يظهر قسم الألوان للزبون.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {PRODUCT_COLOR_LIBRARY.map((color) => {
                const selected = form.colors.some((item) => productColorKey(item) === productColorKey(color));

                return (
                  <button
                    key={productColorKey(color)}
                    type="button"
                    onClick={() => toggleColor(color)}
                    aria-pressed={selected}
                    title={color.name}
                    className={`relative h-10 w-10 rounded-full border transition-[transform,box-shadow,border-color] duration-150 ease-out hover:scale-110 ${
                      selected
                        ? "border-primary shadow-[0_0_0_3px_rgba(201,168,76,0.28)]"
                        : "border-white/20 shadow-sm"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                );
              })}
            </div>

            {form.colors.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.colors.map((color) => (
                  <button
                    key={productColorKey(color)}
                    type="button"
                    onClick={() => removeColor(color)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">الوصف</label>
            <textarea
              value={form.descriptionAr}
              onChange={(event) => updateField("descriptionAr", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary min-h-24"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {editingProduct ? "حفظ التعديل" : "إضافة المنتج"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="border border-border px-6 py-2 rounded-lg text-sm hover:border-primary/50"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeProductItems.map((p: any, i: number) => {
            const image = toSafeArray<string>(p.images)[0] ?? p.imageUrl;
            const productColors = normalizeProductColors(p.colors);

            return (
              <motion.div
                key={p.id ?? i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden group"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={p.nameAr ?? p.name ?? "منتج"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}

                  {!Boolean(p.inStock ?? p.isActive ?? true) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-destructive font-bold">نفذت الكمية</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">
                        {p.nameAr ?? p.name ?? "منتج بدون اسم"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {p.category ?? p.categoryName ?? "بدون تصنيف"}
                      </p>
                    </div>

                    <button
                      onClick={() => openEdit(p)}
                      className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      disabled={!p.id}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(Number(p.id))}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      disabled={!p.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary">
                        {Number(p.price ?? 0).toLocaleString("ar-IQ")} د.ع
                      </p>

                      {p.discountPrice ? (
                        <p className="text-sm line-through text-muted-foreground">
                          {Number(p.discountPrice).toLocaleString("ar-IQ")}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-md ${
                        Boolean(p.inStock ?? p.isActive ?? true)
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {Boolean(p.inStock ?? p.isActive ?? true)
                        ? `${Number(p.stockQuantity ?? p.stock_quantity ?? 0)} قطعة`
                        : "نفذ"}
                    </span>
                  </div>

                  {productColors.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {productColors.slice(0, 10).map((color) => (
                        <span
                          key={productColorKey(color)}
                          className="h-5 w-5 rounded-full border border-white/20"
                          title={color.name}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                      {productColors.length > 10 && (
                        <span className="text-xs text-muted-foreground">+{productColors.length - 10}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {safeProductItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              لا توجد بيانات
            </div>
          )}
        </div>
      )}
    </div>
  );
}
