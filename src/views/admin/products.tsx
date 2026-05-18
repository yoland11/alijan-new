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
import { Trash2, Plus, ShoppingBag, Pencil } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";
import { useState, type FormEvent } from "react";

type ProductForm = {
  nameAr: string;
  category: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  descriptionAr: string;
  images: string;
};

const emptyForm: ProductForm = {
  nameAr: "",
  category: "",
  price: "",
  discountPrice: "",
  stockQuantity: "0",
  descriptionAr: "",
  images: "",
};

export default function AdminProducts() {
  const { data: products, isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const safeProductItems = toSafeArray<any>(products);

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const updateField = (key: keyof ProductForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
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
    });
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
      images: form.images
        .split(/\r?\n/)
        .map((image) => image.trim())
        .filter(Boolean),
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

          <div>
            <label className="text-sm text-muted-foreground">روابط الصور</label>
            <textarea
              value={form.images}
              onChange={(event) => updateField("images", event.target.value)}
              className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary min-h-24"
              placeholder="رابط صورة لكل سطر"
            />
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
