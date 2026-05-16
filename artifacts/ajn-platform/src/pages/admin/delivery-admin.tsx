import { useState } from "react";
import { motion } from "framer-motion";
import { useListDeliveryZones, useCreateDeliveryZone, getListDeliveryZonesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

interface ZoneForm { province: string; area: string; price: number; estimatedDays: number; }

export default function AdminDelivery() {
  const { data: zones, isLoading } = useListDeliveryZones();
  const createZone = useCreateDeliveryZone();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<ZoneForm>({ defaultValues: { estimatedDays: 2 } });
  const safeZones = toSafeArray<any>(zones);

  const onSubmit = (data: ZoneForm) => {
    createZone.mutate({ data: { ...data, price: Number(data.price), estimatedDays: Number(data.estimatedDays) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListDeliveryZonesQueryKey() }); reset(); setShowForm(false); },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">مناطق التوصيل</motion.h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> منطقة جديدة
        </button>
      </div>
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ name: "province", label: "المحافظة" }, { name: "area", label: "المنطقة / الحي" }].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium mb-1">{f.label}</label>
              <input {...register(f.name as any, { required: true })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1">سعر التوصيل (د.ع)</label>
            <input {...register("price", { required: true })} type="number" min="0" className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">أيام التوصيل المتوقعة</label>
            <input {...register("estimatedDays")} type="number" min="1" className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={createZone.isPending} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">إضافة</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-2 rounded-lg text-sm hover:border-primary/50">إلغاء</button>
          </div>
        </motion.form>
      )}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeZones.map((z, i) => (
            <motion.div key={z.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold">{z.province}</h3>
                <p className="text-sm text-muted-foreground">{z.area}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-primary font-bold">{Number(z.price ?? 0).toLocaleString("ar-IQ")} د.ع</span>
                  <span className="text-muted-foreground">{z.estimatedDays} أيام</span>
                </div>
              </div>
            </motion.div>
          ))}
          {safeZones.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
