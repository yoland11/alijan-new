import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useListOrders, useListServiceRequests } from "@workspace/api-client-react";
import { Package, Wrench, Clock } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";
import { formatServiceRequestTrackingCode, getServiceName } from "@/lib/service-catalog";

import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي",
  booked: "تم الحجز", in_progress: "قيد التنفيذ", editing: "قيد المونتاج",
  ready: "جاهز للتسليم",
};
const statusColors: Record<string, string> = {
  pending: "text-amber-500", confirmed: "text-blue-400", processing: "text-blue-400",
  shipped: "text-purple-400", delivered: "text-green-500", cancelled: "text-destructive",
  booked: "text-blue-400", in_progress: "text-blue-400", editing: "text-purple-400",
  ready: "text-green-500",
};

export default function Account() {
  const { data: orders, isLoading: ordersLoading } = useListOrders();
  const { data: serviceReqs, isLoading: srLoading } = useListServiceRequests();

  const safeOrders = toSafeArray<any>(orders);
  const safeServiceReqs = toSafeArray<any>(serviceReqs);


  return (
    <div className="py-16 px-4 container mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-primary mb-12">
        حسابي
      </motion.h1>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Package className="text-primary" />
            طلبات المتجر
          </h2>
          {ordersLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : safeOrders.length ? (

            <div className="space-y-4">
              {safeOrders.map((order, i) => (

                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-6 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono text-primary font-bold text-lg">{order.trackingCode}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString("ar-IQ")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{toSafeArray(order.items).length} منتج</p>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${statusColors[order.status] ?? "text-muted-foreground"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </p>
                    <p className="text-primary font-bold">{Number(order.totalAmount ?? order.total_amount ?? order.total ?? 0).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border">
              لا توجد بيانات
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Wrench className="text-primary" />
            طلبات الخدمات
          </h2>
          {srLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : safeServiceReqs.length ? (

            <div className="space-y-4">
              {safeServiceReqs.map((sr, i) => (

                <motion.div
                  key={sr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-6 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold">{getServiceName(sr.serviceType)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{sr.customerName}</p>
                    <Link
                      to={`/track?code=${formatServiceRequestTrackingCode(sr.id)}`}
                      className="mt-1 inline-block font-mono text-sm font-bold text-primary"
                      dir="ltr"
                    >
                      {formatServiceRequestTrackingCode(sr.id)}
                    </Link>
                    {sr.eventDate && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" /> {sr.eventDate}
                      </p>
                    )}
                  </div>
                  <p className={`font-bold ${statusColors[sr.status] ?? "text-muted-foreground"}`}>
                    {statusLabels[sr.status] ?? sr.status}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border">
              لا توجد بيانات
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
