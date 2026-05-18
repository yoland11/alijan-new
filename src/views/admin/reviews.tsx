import { motion } from "framer-motion";
import { useListReviews, useUpdateReview, useDeleteReview, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Trash2, Star } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

export default function AdminReviews() {
  const { data: reviews, isLoading } = useListReviews({ status: "pending" });
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const queryClient = useQueryClient();
  const safeReviews = toSafeArray<any>(reviews);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey({ status: "pending" }) });

  return (
    <div className="p-6 space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-primary">إدارة التقييمات</motion.h1>
      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {safeReviews.map((r: any, i: number) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold">{r.customerName}</p>
                  <div className="flex items-center gap-0.5">
                    {Array(5).fill(0).map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < Number(r.rating ?? 0) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-muted-foreground text-sm">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{(() => {
                    const d = r?.createdAt ? new Date(r.createdAt) : null;
                    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("ar-IQ") : "-";
                  })()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateReview.mutate({ id: r.id, data: { status: "approved" } }, { onSuccess: invalidate })}
                    className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateReview.mutate({ id: r.id, data: { status: "rejected" } }, { onSuccess: invalidate })}
                    className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteReview.mutate({ id: r.id }, { onSuccess: invalidate })}
                    className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {safeReviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">لا توجد بيانات</div>
          )}
        </div>
      )}
    </div>
  );
}
