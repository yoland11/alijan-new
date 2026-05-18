import { motion } from "framer-motion";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, MapPin, Package, CheckCircle } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";


export default function DeliveryPanel() {
  const { data: orders, isLoading } = useListOrders({ status: "shipped" });
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();

  const markDelivered = (id: number) => {
    updateOrder.mutate({ id, data: { status: "delivered" } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ status: "shipped" }) }),
    });
  };

  const safeOrders = toSafeArray<any>(orders);

  return (

    <div className="py-16 px-4 container mx-auto max-w-3xl">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-primary mb-4">
        لوحة التوصيل
      </motion.h1>
      <p className="text-muted-foreground mb-10">الطلبات المراد توصيلها</p>

      {isLoading ? (

        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : safeOrders.length ? (

        <div className="space-y-4">
          {safeOrders.map((order, i) => (

            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-primary font-bold text-lg">{order.trackingCode}</p>
                  <p className="font-medium text-lg mt-1">{order.customerName}</p>
                </div>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-md text-sm font-bold">قيد التوصيل</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-5">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span dir="ltr">{order.customerPhone}</span></p>
                {order.deliveryAddress && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.deliveryAddress}</p>}
                <p className="flex items-center gap-2"><Package className="w-4 h-4" /> {toSafeArray(order.items).length} منتج — {Number(order.totalAmount ?? order.total_amount ?? order.total ?? 0).toLocaleString("ar-IQ")} د.ع</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => markDelivered(order.id)}
                  className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  تم التسليم
                </button>
                <a href={`https://wa.me/${String(order.customerPhone ?? "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-card border border-border px-5 py-2.5 rounded-lg font-medium hover:border-primary/50 transition-colors">
                  <Phone className="w-4 h-4" />
                  تواصل
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl">لا توجد بيانات</p>
        </div>
      )}
    </div>
  );
}
