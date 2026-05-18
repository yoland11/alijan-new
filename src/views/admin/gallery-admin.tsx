import { useState } from "react";
import { motion } from "framer-motion";
import { useListGallery, useDeleteGalleryItem, useCreateGalleryItem, getListGalleryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

interface GalleryForm { url: string; category: string; titleAr: string; type: string; }

export default function AdminGallery() {
  const { data: items, isLoading } = useListGallery();
  const deleteItem = useDeleteGalleryItem();
  const createItem = useCreateGalleryItem();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<GalleryForm>({ defaultValues: { type: "image" } });
  const safeItems = toSafeArray<any>(items);

  const onSubmit = (data: GalleryForm) => {
    createItem.mutate({ data }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() }); reset(); setShowForm(false); },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">إدارة المعرض</motion.h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> إضافة صورة
        </button>
      </div>
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1">رابط الصورة / الفيديو</label>
            <input {...register("url", { required: true })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="https://..." dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">التصنيف</label>
            <input {...register("category", { required: true })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">النوع</label>
            <select {...register("type")} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="image">صورة</option>
              <option value="video">فيديو</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">العنوان (عربي)</label>
            <input {...register("titleAr")} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={createItem.isPending} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">إضافة</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-2 rounded-lg text-sm hover:border-primary/50">إلغاء</button>
          </div>
        </motion.form>
      )}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {safeItems.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="relative group aspect-square bg-card border border-border rounded-xl overflow-hidden">
              {item.type === "image" ? (
                <img src={item.thumbnailUrl ?? item.url} alt={item.titleAr ?? ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => deleteItem.mutate({ id: item.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() }) })}
                  className="p-2 bg-destructive rounded-lg"><Trash2 className="w-4 h-4 text-white" /></button>
              </div>
              {item.titleAr && (
                <div className="absolute bottom-0 inset-x-0 p-2 bg-black/60 text-xs text-white truncate">{item.titleAr}</div>
              )}
            </motion.div>
          ))}
          {safeItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
