import { useState } from "react";
import { Link } from "react-router-dom";
import { getTrackOrderQueryKey, useTrackOrder } from "@workspace/api-client-react";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  const { data: order, isLoading, isError } = useTrackOrder(submittedCode, {
    query: {
      queryKey: getTrackOrderQueryKey(submittedCode),
      enabled: !!submittedCode,
    },
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setSubmittedCode(trackingCode.trim());
    }
  };

  const steps = [
    { id: 'pending', label: 'قيد المراجعة', icon: Clock },
    { id: 'confirmed', label: 'مؤكد', icon: CheckCircle },
    { id: 'processing', label: 'جاري التجهيز', icon: Package },
    { id: 'shipped', label: 'في الطريق', icon: Truck },
    { id: 'delivered', label: 'تم التسليم', icon: CheckCircle },
  ];

  const getStepIndex = (status?: string) => {
    if (!status) return -1;
    return steps.findIndex(s => s.id === status);
  };

  const currentStep = getStepIndex(order?.status);

  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">تتبع طلبك</h1>
          <p className="text-muted-foreground">
            أدخل رقم التتبع الخاص بك لمعرفة حالة طلبك الحالي
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-4 mb-12">
          <Input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="مثال: AJN-123456"
            className="flex-1 h-14 text-lg"
            dir="ltr"
          />
          <Button type="submit" className="h-14 px-8 text-lg" disabled={isLoading}>
            {isLoading ? "جاري البحث..." : "تتبع"}
            <Search className="mr-2 w-5 h-5" />
          </Button>
        </form>

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 text-center">
            لم نتمكن من العثور على طلب بهذا الرقم. يرجى التأكد من الرقم والمحاولة مرة أخرى.
          </div>
        )}

        {order && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg shadow-black/20">
            <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">رقم الطلب</p>
                <p className="text-xl font-bold">{order.trackingCode}</p>
              </div>
              <div className="text-left">
                <p className="text-muted-foreground text-sm mb-1">تاريخ الطلب</p>
                <p className="font-medium" dir="ltr">{new Date(order.createdAt).toLocaleDateString('ar-IQ')}</p>
              </div>
            </div>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 w-full h-1 bg-muted rounded-full overflow-hidden" dir="ltr">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-in-out"
                  style={{ width: `${Math.max(0, currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>

              <div className="flex justify-between relative z-10">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                          ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'}
                          ${isCurrent ? 'shadow-[0_0_20px_rgba(201,168,76,0.3)] scale-110' : ''}
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`mt-3 text-sm font-bold text-center w-20
                        ${isCompleted ? 'text-primary' : 'text-muted-foreground'}
                      `}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.status === 'cancelled' && (
              <div className="mt-8 bg-destructive/10 text-destructive p-4 rounded-lg text-center font-bold">
                تم إلغاء هذا الطلب
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
