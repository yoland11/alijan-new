import { useState } from "react";
import { motion } from "framer-motion";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

function safeNewDate(value: unknown) {
  const d = value ? new Date(value as any) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

const statuses = [
  { value: "", label: "الكل" },
  { value: "pending", label: "انتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "processing", label: "جاري التجهيز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];
const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400", confirmed: "bg-blue-500/20 text-blue-400",
  processing: "bg-blue-500/20 text-blue-400", shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400", cancelled: "bg-red-500/20 text-red-400",
};

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: orders, isLoading } = useListOrders(statusFilter ? { status: statusFilter } : {});
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const safeOrders = toSafeArray<any>(orders);

  const handleStatusChange = (id: number, status: string) => {
    updateOrder.mutate(
      { id, data: { status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
    );
  };

  return (
    <div className="p-6 space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">إدارة الطلبات</motion.h1>

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s.value ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary/50"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["رمز التتبع","الزبون","الهاتف","المبلغ","الحالة","التاريخ","تحديث"].map(h => (
                  <th key={h} className="text-right px-4 py-4 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeOrders.map((order) => {
                const createdAt = safeNewDate(order.createdAt ?? order.created_at);
                const totalAmount = Number(order.totalAmount ?? order.total_amount ?? order.total ?? 0);

                return (
                  <tr key={order.id ?? JSON.stringify(order)} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4 font-mono text-primary">{order.trackingCode ?? order.orderCode ?? order.order_code ?? "-"}</td>
                    <td className="px-4 py-4 font-medium">{order.customerName ?? order.customer_name ?? order.name ?? "-"}</td>
                    <td className="px-4 py-4 text-muted-foreground" dir="ltr">{order.customerPhone ?? order.customer_phone ?? "-"}</td>
                    <td className="px-4 py-4 font-bold">{totalAmount.toLocaleString("ar-IQ")} د.ع</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${statusColors[order.status] ?? ""}`}>
                        {statuses.find((s) => s.value === order.status)?.label ?? order.status ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{createdAt ? createdAt.toLocaleDateString("ar-IQ") : "-"}</td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status ?? ""}
                        onChange={(e) => handleStatusChange(Number(order.id), e.target.value)}
                        className="bg-input border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                      >
                        {statuses.filter((s) => s.value).map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {safeOrders.length === 0 && (

                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">لا توجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
