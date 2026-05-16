import { useState } from "react";
import { motion } from "framer-motion";
import { useListTransactions, useGetAccountingSummary, useCreateTransaction, getListTransactionsQueryKey, getGetAccountingSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

interface TxForm { type: string; account: string; toAccount: string; amount: number; description: string; date: string; }

const accountLabels: Record<string, string> = {
  cash: "الصندوق", bank: "مصرف", zain_cash: "زين كاش", master_card: "ماستر كارد", asia_hawala: "آسيا حوالة",
};
const typeLabels: Record<string, string> = { receipt: "قبض", expense: "صرف", transfer: "تحويل" };
const typeColors: Record<string, string> = { receipt: "text-green-500", expense: "text-destructive", transfer: "text-blue-400" };

export default function AdminAccounting() {
  const { data: transactions, isLoading } = useListTransactions();
  const { data: summary, isLoading: summaryLoading } = useGetAccountingSummary();
  const createTx = useCreateTransaction();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<TxForm>({ defaultValues: { type: "receipt", account: "cash", date: new Date().toISOString().split("T")[0] } });
  const txType = watch("type");
  const safeTransactions = toSafeArray<any>(transactions);

  const onSubmit = (data: TxForm) => {
    createTx.mutate({ data: { ...data, amount: Number(data.amount) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAccountingSummaryQueryKey() });
        reset(); setShowForm(false);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">الحسابات</motion.h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> سند جديد
        </button>
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "إجمالي الإيرادات", value: summary.totalRevenue, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "إجمالي المصاريف", value: summary.totalExpenses, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "صافي الأرباح", value: summary.profit, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            { label: "الصندوق", value: summary.cashBalance, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "المصرف", value: summary.bankBalance, icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "زين كاش", value: summary.zainCashBalance, icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{Number(value ?? 0).toLocaleString("ar-IQ")} د.ع</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">نوع السند</label>
            <select {...register("type")} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="receipt">سند قبض</option>
              <option value="expense">سند صرف</option>
              <option value="transfer">سند تحويل</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">الحساب</label>
            <select {...register("account")} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
              {Object.entries(accountLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {txType === "transfer" && (
            <div>
              <label className="block text-xs font-medium mb-1">إلى حساب</label>
              <select {...register("toAccount")} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                {Object.entries(accountLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1">المبلغ</label>
            <input {...register("amount", { required: true })} type="number" min="0" className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">التاريخ</label>
            <input {...register("date", { required: true })} type="date" className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium mb-1">الوصف</label>
            <input {...register("description", { required: true })} className="w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="وصف العملية" />
          </div>
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={createTx.isPending} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">حفظ السند</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-2 rounded-lg text-sm hover:border-primary/50">إلغاء</button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>{["النوع","الحساب","المبلغ","الوصف","التاريخ"].map(h => (
                <th key={h} className="text-right px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {safeTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className={`px-4 py-3 font-bold ${typeColors[tx.type] ?? ""}`}>{typeLabels[tx.type] ?? tx.type}</td>
                  <td className="px-4 py-3">{accountLabels[tx.account] ?? tx.account}</td>
                  <td className={`px-4 py-3 font-bold ${tx.type === "receipt" ? "text-green-500" : tx.type === "expense" ? "text-destructive" : ""}`}>
                    {Number(tx.amount ?? 0).toLocaleString("ar-IQ")} د.ع
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                </tr>
              ))}
              {safeTransactions.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">لا توجد بيانات</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
