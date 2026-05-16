import { motion } from "framer-motion";
import { useListBookings, useUpdateBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

const statuses = [
  { value: "confirmed", label: "مؤكد" }, { value: "awaiting_payment", label: "بانتظار الدفع" },
  { value: "completed", label: "مكتمل" }, { value: "cancelled", label: "ملغي" },
];
const statusColors: Record<string, string> = {
  confirmed: "bg-blue-500/20 text-blue-400", awaiting_payment: "bg-amber-500/20 text-amber-400",
  completed: "bg-green-500/20 text-green-400", cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminBookings() {
  const { data: bookings, isLoading } = useListBookings();
  const updateBooking = useUpdateBooking();
  const queryClient = useQueryClient();
  const safeBookings = toSafeArray<any>(bookings);

  return (
    <div className="p-6 space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">الحجوزات</motion.h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeBookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-xl p-5 relative overflow-hidden"
              style={{ borderColor: b.color ?? "#c9a84c33" }}>
              <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: b.color ?? "#c9a84c" }} />
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-lg">{b.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${statusColors[b.status] ?? ""}`}>
                  {statuses.find(s => s.value === b.status)?.label ?? b.status}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                <p className="flex items-center gap-2"><User className="w-4 h-4" /> {b.customerName}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span dir="ltr">{b.customerPhone}</span></p>
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {b.date}</p>
                {b.time && <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {b.time}</p>}
              </div>
              <select value={b.status}
                onChange={(e) => updateBooking.mutate({ id: b.id, data: { status: e.target.value } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() }) })}
                className="bg-input border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary w-full">
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </motion.div>
          ))}
          {safeBookings.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
