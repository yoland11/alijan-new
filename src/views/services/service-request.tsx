import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCreateServiceRequest } from "@workspace/api-client-react";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

const serviceNames: Record<string, string> = {
  koshat: "كوشات",
  photography: "تصوير",
  albums: "ألبومات",
  graduation: "تجهيزات تخرج",
  research: "بحوث",
  distributions: "توزيعات",
  gifts: "هدايا",
};

interface ServiceForm {
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  location: string;
  sessionType: string;
  frameType: string;
  sessionStyle: string;
  researchTitle: string;
  studentNames: string;
  supervisor: string;
  university: string;
  department: string;
  copies: string;
  bindingType: string;
  albumType: string;
  photoCount: string;
  albumSize: string;
  albumDetails: string;
  notes: string;
}

export default function ServiceRequest() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const createSR = useCreateServiceRequest();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceForm>();

  const serviceName = serviceNames[type ?? ""] ?? type;

  const onSubmit = (data: ServiceForm) => {
    const details: Record<string, unknown> = {};
    const addIfPresent = (key: string, value?: string) => {
      const normalized = value?.trim();
      if (normalized) details[key] = normalized;
    };

    if (type === "photography") {
      addIfPresent("sessionType", data.sessionType);
      addIfPresent("frameType", data.frameType);
      addIfPresent("sessionStyle", data.sessionStyle);
    } else if (type === "research") {
      addIfPresent("researchTitle", data.researchTitle);
      addIfPresent("studentNames", data.studentNames);
      addIfPresent("supervisor", data.supervisor);
      addIfPresent("university", data.university);
      addIfPresent("department", data.department);
      addIfPresent("copies", data.copies);
      addIfPresent("bindingType", data.bindingType);
    } else if (type === "albums") {
      addIfPresent("albumType", data.albumType);
      addIfPresent("photoCount", data.photoCount);
      addIfPresent("albumSize", data.albumSize);
      addIfPresent("albumDetails", data.albumDetails);
    }
    createSR.mutate(
      {
        data: {
          serviceType: type as any,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          eventDate: data.eventDate || undefined,
          eventTime: data.eventTime || undefined,
          location: data.location || undefined,
          details: Object.keys(details).length > 0 ? details : null,
          notes: data.notes || undefined,
        },
      },
      { onSuccess: () => setDone(true) }
    );
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle className="w-24 h-24 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold">تم إرسال طلبك بنجاح!</h2>
        <p className="text-muted-foreground text-lg">سيتواصل معك فريقنا في أقرب وقت</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/services")}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
          >
            العودة للخدمات
          </button>
          <a
            href="https://wa.me/9647725762520"
            target="_blank"
            rel="noreferrer"
            className="border border-border px-8 py-3 rounded-md font-bold hover:border-primary hover:text-primary transition-colors"
          >
            تواصل عبر واتساب
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 container mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-primary mb-3">طلب خدمة {serviceName}</h1>
        <p className="text-muted-foreground mb-10">أدخل بياناتك وسنتواصل معك لتأكيد الطلب</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
            <input {...register("customerName", { required: true })}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="اسمك الكامل"
            />
            {errors.customerName && <p className="text-destructive text-xs mt-1">مطلوب</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
            <input {...register("customerPhone", { required: true })}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="07XX XXX XXXX" dir="ltr"
            />
            {errors.customerPhone && <p className="text-destructive text-xs mt-1">مطلوب</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">التاريخ</label>
            <input {...register("eventDate")} type="date"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الوقت</label>
            <input {...register("eventTime")} type="time"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">الموقع / المكان</label>
          <input {...register("location")}
            className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            placeholder="أدخل الموقع أو المكان"
          />
        </div>

        {type === "photography" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">نوع الجلسة</label>
              <select {...register("sessionType")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors">
                <option value="">اختر نوع الجلسة</option>
                <option value="indoor">داخلي</option>
                <option value="outdoor">خارجي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">نوع الكادر</label>
              <input {...register("frameType")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="نوع الكادر المطلوب" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">أسلوب التصوير</label>
              <input {...register("sessionStyle")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="أسلوب التصوير المطلوب" />
            </div>
          </>
        )}

        {type === "research" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">عنوان البحث *</label>
              <input {...register("researchTitle", { required: type === "research" })} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="عنوان البحث أو الرسالة" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">أسماء الطلبة</label>
              <input {...register("studentNames")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="أسماء الطلبة (مفصولة بفواصل)" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المشرف</label>
                <input {...register("supervisor")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="اسم المشرف" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الجامعة</label>
                <input {...register("university")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="اسم الجامعة" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">القسم</label>
                <input {...register("department")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="القسم الدراسي" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">عدد النسخ</label>
                <input {...register("copies")} type="number" min="1" className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="عدد النسخ المطلوبة" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">نوع التجليد</label>
              <select {...register("bindingType")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors">
                <option value="">اختر نوع التجليد</option>
                <option value="hard">تجليد صلب</option>
                <option value="soft">تجليد ناعم</option>
                <option value="spiral">تجليد حلزوني</option>
                <option value="glue">تجليد لاصق</option>
              </select>
            </div>
          </>
        )}

        {type === "albums" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">نوع الألبوم</label>
              <input {...register("albumType")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="مثال: فاخر، كلاسيك، جلد" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">عدد الصور</label>
                <input {...register("photoCount")} type="number" min="0" className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="اختياري" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الحجم</label>
                <input {...register("albumSize")} className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="اختياري" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تفاصيل الألبوم</label>
              <textarea {...register("albumDetails")} rows={3}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="تفاصيل اختيارية عن الألبوم"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
          <textarea {...register("notes")} rows={4}
            className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="أي تفاصيل أو ملاحظات إضافية..."
          />
        </div>

        <button
          type="submit"
          disabled={createSR.isPending}
          className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createSR.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      </motion.form>
    </div>
  );
}
