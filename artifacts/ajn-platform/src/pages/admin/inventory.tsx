import { useState } from "react";
import { motion } from "framer-motion";
import { useListInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, getListInventoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";


interface ItemForm { nameAr: string; category: string; quantity: number; minQuantity: number; purchasePrice: number; sellingPrice: number; unit: string; }

export default function AdminInventory() {
  const { data: items, isLoading } = useListInventory();
  const createItem = useCreateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<ItemForm>();

  const onSubmit = (data: ItemForm) => {
    createItem.mutate({ data: { ...data, quantity: Number(data.quantity), minQuantity: Number(data.minQuantity), purchasePrice: Number(data.purchasePrice), sellingPrice: Number(data.sellingPrice) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }); reset(); setShowForm(false); },
    });
  };

  const safeItems = toSafeArray<any>(items);
  const lowStock = safeItems.filter((i) => i?.isLowStock);


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">المخزون</motion.h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> إضافة مادة
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-400 font-medium">
            {lowStock.length} مادة تقترب من النفاد:{" "}
            {lowStock
              .map((i) => i?.nameAr ?? "")
              .filter(Boolean)
              .join("، ")}
          </p>

        </div>

      )}

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[{ name: "nameAr", label: "اسم المادة", req: true }, { name: "category", label: "التصنيف" }, { name: "unit", label: "الوحدة" }].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium mb-1">{f.label}</label>
              <input {...register(f.name as any, { required: !!f.req })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}
          {[{ name: "quantity", label: "الكمية" }, { name: "minQuantity", label: "الحد الأدنى" }, { name: "purchasePrice", label: "سعر الشراء" }, { name: "sellingPrice", label: "سعر البيع" }].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium mb-1">{f.label}</label>
              <input {...register(f.name as any, { required: true })} type="number" min="0" className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={createItem.isPending} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">إضافة</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-2 rounded-lg text-sm hover:border-primary/50">إلغاء</button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>{["المادة","التصنيف","الكمية","الحد الأدنى","سعر الشراء","سعر البيع","الوحدة",""].map(h => (
                <th key={h} className="text-right px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {safeItems.map((item) => (

                <tr key={item.id} className={`border-b border-border/50 transition-colors ${item.isLowStock ? "bg-amber-500/5" : "hover:bg-muted/20"}`}>
                  <td className="px-4 py-3 font-medium">{item.nameAr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category ?? "—"}</td>
                  <td className={`px-4 py-3 font-bold ${item.isLowStock ? "text-amber-500" : ""}`}>
                    {item.quantity} {item.isLowStock && <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.minQuantity}</td>
                  <td className="px-4 py-3">{Number(item.purchasePrice ?? 0).toLocaleString("ar-IQ")} د.ع</td>
                  <td className="px-4 py-3 font-bold text-primary">{Number(item.sellingPrice ?? 0).toLocaleString("ar-IQ")} د.ع</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteItem.mutate({ id: item.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }) })}
                      className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {safeItems.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">لا توجد بيانات</td></tr>}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
