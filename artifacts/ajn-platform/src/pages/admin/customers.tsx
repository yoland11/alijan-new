import { useState } from "react";
import { motion } from "framer-motion";
import { useListCustomers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";


export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useListCustomers(search ? { search } : {});
  const safeCustomers = toSafeArray<any>(customers);

  return (
    <div className="p-6 space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">إدارة الزبائن</motion.h1>
      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-input border border-border rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-primary transition-colors"
          placeholder="ابحث عن زبون..."
        />
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeCustomers.map((c, i) => (

            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{c.name}</h3>
                <p className="text-sm text-muted-foreground" dir="ltr">{c.phone}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{c.totalOrders} طلب</span>
                  <span>{Number(c.totalSpent ?? 0).toLocaleString("ar-IQ")} د.ع</span>
                </div>
              </div>
            </motion.div>
          ))}
          {safeCustomers.length === 0 && (

            <div className="col-span-3 text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              لا توجد بيانات
            </div>
          )}
        </div>
      )}
    </div>
  );
}
