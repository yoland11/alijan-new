import { motion } from "framer-motion";
import {
  useListProducts,
  useDeleteProduct,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, ShoppingBag } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";


export default function AdminProducts() {
  const { data: products, isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const safeProductItems = toSafeArray<any>(products);



  const handleDelete = (id: number) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;

    deleteProduct.mutate(
      { id },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          }),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-primary"
        >
          إدارة المنتجات
        </motion.h1>

        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          منتج جديد
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeProductItems.map((p: any, i: number) => (


            <motion.div
              key={p.id ?? i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden group"
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {toSafeArray<string>(p.images)[0] ? (
                  <img
                    src={toSafeArray<string>(p.images)[0]}
                    alt={p.nameAr ?? p.name ?? "منتج"}
                    className="w-full h-full object-cover"
                  />
                ) : p.imageUrl ? (
                  <img
                    src={p.imageUrl}
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
                    <span className="text-destructive font-bold">
                      نفذت الكمية
                    </span>
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
          ))}

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
