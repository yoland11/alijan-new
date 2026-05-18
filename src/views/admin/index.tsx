import { motion } from "framer-motion";
import {
  useGetDashboardStats,
  useGetRecentOrders,
  useGetRevenueChart,
} from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { toSafeArray } from "@/lib/to-safe-array";

const statusLabels: Record<string, string> = {
  pending: "انتظار",
  confirmed: "مؤكد",
  processing: "جاري",
  shipped: "شحن",
  delivered: "تسليم",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "text-amber-500",
  confirmed: "text-blue-400",
  processing: "text-blue-400",
  shipped: "text-purple-400",
  delivered: "text-green-500",
  cancelled: "text-destructive",
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  link,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  link?: string;
}) {
  const content = (
    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 hover:border-primary/30 transition-colors">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: recentOrders, isLoading: recentLoading } = useGetRecentOrders();
  const { data: revenueData } = useGetRevenueChart();

  const safeRecentOrders = toSafeArray<any>(recentOrders);
  const safeRevenueData = toSafeArray<any>(revenueData);

  return (
    <div className="p-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-primary"
      >
        لوحة الإدارة
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(8)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard
              title="إجمالي الطلبات"
              value={(stats as any)?.totalOrders ?? 0}
              icon={Package}
              color="bg-primary/10"
              link="/admin/orders"
            />
            <StatCard
              title="الإيرادات"
              value={`${Number((stats as any)?.totalRevenue ?? 0).toLocaleString("ar-IQ")} د.ع`}
              icon={DollarSign}
              color="bg-green-500/10"
              link="/admin/accounting"
            />
            <StatCard
              title="طلبات اليوم"
              value={(stats as any)?.todayOrders ?? 0}
              icon={TrendingUp}
              color="bg-blue-500/10"
              link="/admin/orders"
            />
            <StatCard
              title="قيد الانتظار"
              value={(stats as any)?.pendingOrders ?? 0}
              icon={Clock}
              color="bg-amber-500/10"
              link="/admin/orders"
            />
            <StatCard
              title="الزبائن"
              value={(stats as any)?.totalCustomers ?? 0}
              icon={Users}
              color="bg-purple-500/10"
              link="/admin/customers"
            />
            <StatCard
              title="المنتجات"
              value={(stats as any)?.totalProducts ?? 0}
              icon={ShoppingBag}
              color="bg-primary/10"
              link="/admin/products"
            />
            <StatCard
              title="مخزون منخفض"
              value={(stats as any)?.lowStockItems ?? 0}
              icon={AlertTriangle}
              color="bg-red-500/10"
              link="/admin/inventory"
            />
            <StatCard
              title="طلبات خدمات"
              value={(stats as any)?.pendingServiceRequests ?? 0}
              icon={Wrench}
              color="bg-amber-500/10"
              link="/admin/services"
            />
          </>
        )}
      </div>

      {safeRevenueData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">
            الإيرادات والمصاريف (6 أشهر)
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={safeRevenueData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(201,168,76,0.1)"
              />
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 12 }} />
              <YAxis tick={{ fill: "#888", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #c9a84c33",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(v: number) => [
                  `${Number(v ?? 0).toLocaleString("ar-IQ")} د.ع`,
                ]}
              />
              <Bar
                dataKey="revenue"
                name="الإيرادات"
                fill="#c9a84c"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="المصاريف"
                fill="#555"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">آخر الطلبات</h2>
          <Link to="/admin/orders" className="text-primary text-sm hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-right pb-4 font-medium">رمز التتبع</th>
                  <th className="text-right pb-4 font-medium">الزبون</th>
                  <th className="text-right pb-4 font-medium">المبلغ</th>
                  <th className="text-right pb-4 font-medium">الحالة</th>
                  <th className="text-right pb-4 font-medium">التاريخ</th>
                </tr>
              </thead>

              <tbody>
                {safeRecentOrders.map((order: any, index: number) => (
                  <tr
                    key={order.id ?? index}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 font-mono text-primary">
                      {order.trackingCode ??
                        order.orderCode ??
                        order.order_code ??
                        "-"}
                    </td>

                    <td className="py-4">
                      {order.customerName ??
                        order.customer_name ??
                        order.name ??
                        "-"}
                    </td>

                    <td className="py-4 font-bold">
                      {Number(
                        order.totalAmount ??
                          order.total_amount ??
                          order.total ??
                          0,
                      ).toLocaleString("ar-IQ")}{" "}
                      د.ع
                    </td>

                    <td
                      className={`py-4 font-bold ${
                        statusColors[order.status] ?? ""
                      }`}
                    >
                      {statusLabels[order.status] ?? order.status ?? "-"}
                    </td>

                    <td className="py-4 text-muted-foreground">
                      {order.createdAt || order.created_at
                        ? new Date(
                            order.createdAt ?? order.created_at,
                          ).toLocaleDateString("ar-IQ")
                        : "-"}
                    </td>
                  </tr>
                ))}

                {safeRecentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      لا توجد بيانات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
