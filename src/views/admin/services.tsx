import { useState } from "react";
import { motion } from "framer-motion";
import { useListServiceRequests, useUpdateServiceRequest, getListServiceRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toSafeArray } from "@/lib/to-safe-array";
import { formatServiceRequestTrackingCode, getServiceDetailPairs, getServiceName } from "@/lib/service-catalog";
const statuses = [
  { value: "", label: "الكل" }, { value: "pending", label: "انتظار" }, { value: "booked", label: "محجوز" },
  { value: "in_progress", label: "قيد التنفيذ" }, { value: "editing", label: "مونتاج" },
  { value: "ready", label: "جاهز" }, { value: "delivered", label: "تسليم" }, { value: "cancelled", label: "ملغي" },
];
const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400", booked: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-blue-500/20 text-blue-400", editing: "bg-purple-500/20 text-purple-400",
  ready: "bg-green-500/20 text-green-400", delivered: "bg-green-700/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminServices() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: requests, isLoading } = useListServiceRequests(statusFilter ? { status: statusFilter } : {});
  const updateSR = useUpdateServiceRequest();
  const queryClient = useQueryClient();
  const safeRequests = toSafeArray<any>(requests);

  return (
    <div className="p-6 space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">طلبات الخدمات</motion.h1>
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s.value ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary/50"}`}>
            {s.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {safeRequests.map((sr: any, i: number) => (
            <motion.div key={sr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-primary font-bold">{getServiceName(sr.serviceType)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[sr.status] ?? ""}`}>
                      {statuses.find(s => s.value === sr.status)?.label ?? sr.status}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                      {formatServiceRequestTrackingCode(sr.id)}
                    </span>
                  </div>
                  <p className="font-medium">{sr.customerName}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{sr.customerPhone}</p>
                  {sr.eventDate && <p className="text-sm text-muted-foreground mt-1">التاريخ: {sr.eventDate} {sr.eventTime ?? ""}</p>}
                  {(() => {
                    const pairs = getServiceDetailPairs(sr.serviceType, sr.details).slice(0, 6);
                    if (pairs.length === 0) return null;

                    return (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                        {pairs.map((item) => (
                          <div key={item.key} className="rounded-lg border border-border bg-background/40 px-3 py-2">
                            <p className="text-[11px] text-muted-foreground">{item.label}</p>
                            <p className="mt-1 text-xs font-medium">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {sr.notes && <p className="text-sm text-muted-foreground mt-1">{sr.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-muted-foreground">{(() => {
                    const d = sr?.createdAt ? new Date(sr.createdAt) : null;
                    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("ar-IQ") : "-";
                  })()}</p>
                  <select value={sr.status} onChange={(e) => updateSR.mutate({ id: sr.id, data: { status: e.target.value } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListServiceRequestsQueryKey() }) })}
                    className="bg-input border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary">
                    {statuses.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}

          {safeRequests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
