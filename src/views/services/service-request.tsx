import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useCreateServiceRequest, type ServiceRequest } from "@workspace/api-client-react";
import {
  buildServiceRequestSchema,
  buildServiceWhatsAppUrl,
  formatServiceRequestTrackingCode,
  getServiceBySlug,
  getServiceFields,
  type ServiceDefinition,
  type ServiceField,
  type ServiceFormValues,
  type ServiceSection,
} from "@/lib/service-catalog";

const inputClass =
  "w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors";
const panelClass = "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-lg shadow-black/10";

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getFileMetadata(value: unknown) {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
  }

  return [];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

async function uploadSelectedFiles(service: ServiceDefinition, data: ServiceFormValues) {
  const record = data as Record<string, unknown>;
  const filePayloads = [];

  for (const field of getServiceFields(service).filter((item) => item.type === "file")) {
    const rawValue = record[field.name];
    if (typeof FileList === "undefined" || !(rawValue instanceof FileList) || rawValue.length === 0) continue;

    for (const file of Array.from(rawValue)) {
      filePayloads.push({
        data: await readFileAsDataUrl(file),
        fieldName: field.name,
        name: file.name,
        serviceType: service.serviceType,
        size: file.size,
        type: file.type,
      });
    }
  }

  if (!filePayloads.length) return { details: {}, warning: "" };

  try {
    const response = await fetch("/api/service-uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: filePayloads }),
    });

    if (!response.ok) throw new Error("Upload failed");

    const payload = await response.json() as { files?: Array<Record<string, unknown> & { fieldName?: string }> };
    const grouped = (payload.files ?? []).reduce<Record<string, unknown[]>>((acc, file) => {
      const fieldName = file.fieldName ?? "attachments";
      acc[fieldName] = [...(acc[fieldName] ?? []), file];
      return acc;
    }, {});

    return { details: grouped, warning: "" };
  } catch {
    return {
      details: {},
      warning: "تعذر رفع الملفات إلى التخزين حالياً، وتم حفظ أسماء الملفات مع الطلب حتى لا يتوقف الحجز.",
    };
  }
}

function buildDetails(service: ServiceDefinition, data: ServiceFormValues) {
  const record = data as Record<string, unknown>;
  const details: Record<string, unknown> = {
    serviceLabel: service.shortTitle,
    serviceTitle: service.title,
  };

  for (const field of getServiceFields(service)) {
    const rawValue = record[field.name];

    if (field.type === "file") {
      const files = getFileMetadata(rawValue);
      if (files.length > 0) details[field.name] = files;
      continue;
    }

    const value = trimString(rawValue);
    if (value) details[field.name] = value;
  }

  return details;
}

function deriveLocation(service: ServiceDefinition, data: ServiceFormValues): string | undefined {
  const record = data as Record<string, unknown>;
  const candidates = [
    trimString(record.shootingLocation),
    trimString(record.address),
    [trimString(record.province), trimString(record.address)].filter(Boolean).join(" - "),
  ].filter(Boolean);

  return candidates[0] || undefined;
}

function deriveEventDate(data: ServiceFormValues): string | undefined {
  const record = data as Record<string, unknown>;
  return trimString(record.eventDate) || trimString(record.deliveryDeadline) || trimString(record.occasionDate) || undefined;
}

function deriveEventTime(data: ServiceFormValues): string | undefined {
  const record = data as Record<string, unknown>;
  return trimString(record.eventTime) || trimString(record.sessionTime) || trimString(record.graduationTime) || undefined;
}

function FieldRenderer({
  field,
  register,
  error,
}: {
  field: ServiceField;
  register: ReturnType<typeof useForm<ServiceFormValues>>["register"];
  error?: string;
}) {
  const wrapperClass = field.wide ? "md:col-span-2" : "";

  return (
    <div className={wrapperClass}>
      <label className="block text-sm font-medium mb-2">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          {...register(field.name)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder={field.placeholder}
        />
      ) : field.type === "select" ? (
        <select {...register(field.name)} className={inputClass}>
          <option value="">اختر</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "file" ? (
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-input/60 px-4 py-5 text-center transition-colors hover:border-primary/60">
          <Upload className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{field.multiple ? "اختر الملفات" : "اختر ملف"}</span>
          {field.helperText && <span className="text-xs text-muted-foreground">{field.helperText}</span>}
          <input
            {...register(field.name)}
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            className="sr-only"
          />
        </label>
      ) : (
        <input
          {...register(field.name)}
          type={field.type}
          className={inputClass}
          placeholder={field.placeholder}
          dir={field.type === "number" || field.type === "time" || field.type === "date" ? "ltr" : undefined}
          min={field.type === "number" ? 0 : undefined}
        />
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SectionFields({
  section,
  register,
  errors,
}: {
  section: ServiceSection;
  register: ReturnType<typeof useForm<ServiceFormValues>>["register"];
  errors: ReturnType<typeof useForm<ServiceFormValues>>["formState"]["errors"];
}) {
  return (
    <section className={panelClass}>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-primary">{section.title}</h2>
        {section.description && <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {section.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            register={register}
            error={errors[field.name as keyof ServiceFormValues]?.message as string | undefined}
          />
        ))}
      </div>
    </section>
  );
}

function SuccessState({ service, request }: { service: ServiceDefinition; request: ServiceRequest }) {
  const navigate = useNavigate();
  const trackingCode = formatServiceRequestTrackingCode(request.id);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
        <CheckCircle className="w-24 h-24 text-primary" />
      </motion.div>
      <div>
        <h2 className="text-3xl font-bold">تم إرسال طلبك بنجاح</h2>
        <p className="mt-3 text-muted-foreground text-lg">سيتواصل معك فريقنا لتأكيد تفاصيل {service.shortTitle}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card px-6 py-4">
        <p className="text-sm text-muted-foreground">رقم تتبع الخدمة</p>
        <p className="mt-1 font-mono text-3xl font-bold text-primary tracking-wider" dir="ltr">{trackingCode}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(`/track?code=${trackingCode}`)}
          className="rounded-md bg-primary px-8 py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          تتبع الطلب
        </button>
        <a
          href={buildServiceWhatsAppUrl(service, trackingCode)}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-border px-8 py-3 font-bold transition-colors hover:border-primary hover:text-primary"
        >
          تواصل عبر واتساب
        </a>
      </div>
    </div>
  );
}

export default function ServiceRequest() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const service = getServiceBySlug(type);
  const createSR = useCreateServiceRequest();
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);
  const [step, setStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadWarning, setUploadWarning] = useState("");
  const schema = useMemo(() => (service ? buildServiceRequestSchema(service) : null), [service]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onSubmit",
  });

  if (!service || !schema) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">الخدمة غير موجودة</h1>
        <p className="text-muted-foreground mb-8">اختر خدمة من صفحة الخدمات للمتابعة.</p>
        <Link to="/services" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground">
          العودة للخدمات
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  if (createdRequest) {
    return <SuccessState service={service} request={createdRequest} />;
  }

  const commonSection: ServiceSection = {
    title: "بيانات العميل",
    description: "هذه البيانات الأساسية مطلوبة حتى نقدر نؤكد الطلب معك.",
    fields: [
      { name: "customerName", label: "اسم الزبون", type: "text", placeholder: "الاسم الكامل", required: true },
      { name: "customerPhone", label: "رقم الهاتف", type: "text", placeholder: "077..." , required: true },
      { name: "eventDate", label: "تاريخ الحجز", type: "date" },
      { name: "eventTime", label: "وقت الحجز", type: "time" },
    ],
  };
  const allSections = [commonSection, ...service.sections];
  const visibleSections = service.multiStep ? [allSections[step]] : allSections;
  const isFinalStep = !service.multiStep || step === allSections.length - 1;

  const onSubmit = async (data: ServiceFormValues) => {
    setUploadWarning("");
    setIsUploading(true);
    const uploadResult = await uploadSelectedFiles(service, data);
    setIsUploading(false);
    setUploadWarning(uploadResult.warning);

    const details = {
      ...buildDetails(service, data),
      ...uploadResult.details,
    };
    const notes = trimString((data as Record<string, unknown>).notes);

    createSR.mutate(
      {
        data: {
          serviceType: service.serviceType,
          customerName: trimString((data as Record<string, unknown>).customerName),
          customerPhone: trimString((data as Record<string, unknown>).customerPhone),
          eventDate: deriveEventDate(data),
          eventTime: deriveEventTime(data),
          location: deriveLocation(service, data),
          details,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (request) => setCreatedRequest(request),
      }
    );
  };

  const goNext = async () => {
    const fieldsToValidate = allSections[step].fields.map((field) => field.name);
    const ok = await trigger(fieldsToValidate);
    if (ok) setStep((current) => Math.min(current + 1, allSections.length - 1));
  };

  return (
    <div className="py-10 px-4 container mx-auto max-w-5xl">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-[2rem] border border-border bg-card"
      >
        <img src={service.image} alt={service.title} className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/90 to-background/50" />
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <Link to="/services" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80">
            كل الخدمات
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-primary">{service.subtitle}</p>
              <h1 className="mt-2 text-4xl font-bold text-white">{service.title}</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground leading-8">{service.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {service.highlights.map((item) => (
                  <span key={item} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-5 backdrop-blur">
              <p className="text-sm text-muted-foreground">السعر</p>
              <p className="mt-1 text-xl font-bold text-primary">{service.priceText}</p>
              <a
                href={buildServiceWhatsAppUrl(service)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-3 font-bold hover:border-primary hover:text-primary"
              >
                واتساب مباشر
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {service.multiStep && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-bold text-primary">خطوة {step + 1} من {allSections.length}</span>
            <span className="text-muted-foreground">{allSections[step].title}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / allSections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {visibleSections.map((section) => (
          <SectionFields key={section.title} section={section} register={register} errors={errors} />
        ))}

        {isFinalStep && (
          <section className={panelClass}>
            <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
            <textarea
              {...register("notes")}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="أي تفاصيل أو ملاحظات إضافية..."
            />
            {uploadWarning && (
              <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                {uploadWarning}
              </p>
            )}
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {service.multiStep && step > 0 && (
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-4 font-bold transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-5 w-5" />
              السابق
            </button>
          )}

          {isFinalStep ? (
            <button
              type="submit"
              disabled={createSR.isPending || isUploading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isUploading ? "جاري رفع الملفات..." : createSR.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              <ShieldCheck className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              التالي
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
      </motion.form>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className={panelClass}>
          <h2 className="mb-5 text-xl font-bold text-primary">معرض من الخدمة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {service.gallery.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-xl border border-border bg-background/45">
                <img src={item.image} alt={item.title} className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={panelClass}>
          <h2 className="mb-5 text-xl font-bold text-primary">مراحل المتابعة</h2>
          <div className="space-y-4">
            {service.trackingSteps.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
