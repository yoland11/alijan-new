import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { getTrackOrderQueryKey, useTrackOrder } from "@workspace/api-client-react";
import { CheckCircle, Clock, Package, Search, Truck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getServiceDetailPairs,
  getServiceName,
  getServiceTrackingSteps,
  serviceStatusLabels,
} from "@/lib/service-catalog";

const orderSteps = [
  { id: "pending", label: "قيد المراجعة", description: "تم استلام الطلب.", icon: Clock },
  { id: "confirmed", label: "مؤكد", description: "تم تأكيد الطلب.", icon: CheckCircle },
  { id: "processing", label: "جاري التجهيز", description: "طلبك قيد التجهيز.", icon: Package },
  { id: "shipped", label: "في الطريق", description: "الطلب خرج للتوصيل.", icon: Truck },
  { id: "delivered", label: "تم التسليم", description: "تم تسليم الطلب.", icon: CheckCircle },
];

type TrackedResult = {
  trackingCode?: string;
  kind?: "service" | string;
  serviceType?: string;
  status?: string;
  createdAt?: string;
  customerName?: string;
  eventDate?: string | null;
  eventTime?: string | null;
  location?: string | null;
  details?: unknown;
};

function getSafeDate(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("ar-IQ") : "-";
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [trackingCode, setTrackingCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);

  const { data, isLoading, isError } = useTrackOrder(submittedCode, {
    query: {
      queryKey: getTrackOrderQueryKey(submittedCode),
      enabled: !!submittedCode,
    },
  });
  const tracked = data as TrackedResult | undefined;
  const isServiceRequest = tracked?.kind === "service" || submittedCode.toUpperCase().startsWith("SR-");

  useEffect(() => {
    if (initialCode) {
      setTrackingCode(initialCode);
      setSubmittedCode(initialCode);
    }
  }, [initialCode]);

  const steps = useMemo(() => {
    if (!isServiceRequest) return orderSteps;
    return getServiceTrackingSteps(tracked?.serviceType).map((step) => ({
      ...step,
      icon: Wrench,
    }));
  }, [isServiceRequest, tracked?.serviceType]);

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setSubmittedCode(trackingCode.trim());
    }
  };

  const currentStep = tracked?.status ? steps.findIndex((step) => step.id === tracked.status) : -1;
  const servicePairs = isServiceRequest ? getServiceDetailPairs(tracked?.serviceType, tracked?.details).slice(0, 6) : [];

  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">تتبع طلبك</h1>
          <p className="text-muted-foreground">
            أدخل رقم تتبع المتجر أو كود خدمة يبدأ بـ SR لمعرفة الحالة الحالية
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-12">
          <Input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="مثال: AJN123 أو SR-12"
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

        {tracked && (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-border pb-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">رقم الطلب</p>
                <p className="text-xl font-bold" dir="ltr">{tracked.trackingCode ?? submittedCode}</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-muted-foreground text-sm mb-1">نوع الطلب</p>
                <p className="font-bold">
                  {isServiceRequest ? `خدمة ${getServiceName(tracked.serviceType)}` : "طلب متجر"}
                </p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-muted-foreground text-sm mb-1">تاريخ الطلب</p>
                <p className="font-medium" dir="ltr">{getSafeDate(tracked.createdAt)}</p>
              </div>
            </div>

            <div className="relative overflow-x-auto pb-3">
              <div className="absolute top-6 left-0 w-full h-1 bg-muted rounded-full overflow-hidden" dir="ltr">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-in-out"
                  style={{ width: `${Math.max(0, currentStep / Math.max(1, steps.length - 1)) * 100}%` }}
                />
              </div>

              <div className="relative z-10 flex min-w-[620px] justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.id} className="flex w-24 flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                          ${isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted text-muted-foreground"}
                          ${isCurrent ? "shadow-[0_0_20px_rgba(201,168,76,0.3)] scale-110" : ""}
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`mt-3 text-sm font-bold ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {tracked.status === "cancelled" ? (
              <div className="mt-8 bg-destructive/10 text-destructive p-4 rounded-lg text-center font-bold">
                تم إلغاء هذا الطلب
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-border bg-background/45 p-4">
                <p className="text-sm text-muted-foreground">الحالة الحالية</p>
                <p className="mt-1 font-bold text-primary">
                  {isServiceRequest ? serviceStatusLabels[tracked.status ?? ""] ?? tracked.status : steps[currentStep]?.label ?? tracked.status}
                </p>
              </div>
            )}

            {isServiceRequest && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {tracked.customerName && (
                  <div className="rounded-xl border border-border bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">الزبون</p>
                    <p className="mt-1 font-bold">{tracked.customerName}</p>
                  </div>
                )}
                {(tracked.eventDate || tracked.eventTime) && (
                  <div className="rounded-xl border border-border bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">الموعد</p>
                    <p className="mt-1 font-bold">{[tracked.eventDate, tracked.eventTime].filter(Boolean).join(" - ")}</p>
                  </div>
                )}
                {tracked.location && (
                  <div className="rounded-xl border border-border bg-background/45 p-4 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">الموقع</p>
                    <p className="mt-1 font-bold">{tracked.location}</p>
                  </div>
                )}
                {servicePairs.map((item) => (
                  <div key={item.key} className="rounded-xl border border-border bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
