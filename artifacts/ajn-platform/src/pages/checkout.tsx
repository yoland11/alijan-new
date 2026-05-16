import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { useCreateOrder, useListDeliveryZones } from "@workspace/api-client-react";
import { CheckCircle } from "lucide-react";
import { toSafeArray } from "@/lib/to-safe-array";

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZoneId: string;
  notes: string;
}

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { data: zones, isLoading: zonesLoading } = useListDeliveryZones();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);
  const safeItems = toSafeArray<CartItem>(items);
  const safeZones = toSafeArray<any>(zones);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>();
  const selectedZoneId = watch("deliveryZoneId");
  const selectedZone = safeZones.find((z) => z.id === parseInt(selectedZoneId));
  const deliveryFee = selectedZone ? Number(selectedZone.price ?? 0) : 0;
  const grandTotal = total + deliveryFee;

  const onSubmit = (data: CheckoutForm) => {
    createOrder.mutate(
      {
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryZoneId: parseInt(data.deliveryZoneId) || undefined,
          notes: data.notes || undefined,
          totalAmount: grandTotal,
          items: safeItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.price,
            color: i.color,
          })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setSuccess(order.trackingCode);
        },
      }
    );
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle className="w-24 h-24 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold">تم تأكيد طلبك!</h2>
        <p className="text-muted-foreground text-lg">رمز التتبع الخاص بك:</p>
        <div className="bg-card border border-primary rounded-xl px-8 py-4">
          <p className="text-3xl font-mono font-bold text-primary tracking-widest">{success}</p>
        </div>
        <p className="text-muted-foreground">احتفظ بهذا الرمز لمتابعة طلبك</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/track?code=${success}`)}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
          >
            تتبع الطلب
          </button>
          <button
            onClick={() => navigate("/store")}
            className="border border-border px-8 py-3 rounded-md font-bold hover:border-primary hover:text-primary transition-colors"
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    );
  }

  if (safeItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="py-16 px-4 container mx-auto max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-primary mb-12"
      >
        إتمام الطلب
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
            <input
              {...register("customerName", { required: true })}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="أدخل اسمك الكامل"
            />
            {errors.customerName && <p className="text-destructive text-sm mt-1">هذا الحقل مطلوب</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
            <input
              {...register("customerPhone", { required: true })}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="07XX XXX XXXX"
              dir="ltr"
            />
            {errors.customerPhone && <p className="text-destructive text-sm mt-1">هذا الحقل مطلوب</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">منطقة التوصيل</label>
            <select
              {...register("deliveryZoneId", { required: true })}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">اختر منطقة التوصيل</option>
              {safeZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.province} - {z.area} ({Number(z.price ?? 0).toLocaleString("ar-IQ")} د.ع)
                </option>
              ))}
            </select>
            {errors.deliveryZoneId && <p className="text-destructive text-sm mt-1">اختر منطقة التوصيل</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">عنوان التوصيل</label>
            <textarea
              {...register("deliveryAddress", { required: true })}
              rows={3}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="أدخل عنوان التوصيل بالتفصيل"
            />
            {errors.deliveryAddress && <p className="text-destructive text-sm mt-1">هذا الحقل مطلوب</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
            <textarea
              {...register("notes")}
              rows={2}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="أي ملاحظات خاصة..."
            />
          </div>
          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createOrder.isPending ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24"
        >
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">ملخص الطلب</h2>
          <div className="space-y-4 mb-6">
            {safeItems.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  {item.color && <p className="text-xs text-muted-foreground">اللون: {item.color}</p>}
                  <p className="text-sm text-muted-foreground">×{item.quantity}</p>
                </div>
                <p className="font-bold flex-shrink-0">{(item.price * item.quantity).toLocaleString("ar-IQ")} د.ع</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-border text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{total.toLocaleString("ar-IQ")} د.ع</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>التوصيل</span>
              <span>{deliveryFee.toLocaleString("ar-IQ")} د.ع</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>الإجمالي</span>
              <span className="text-primary">{grandTotal.toLocaleString("ar-IQ")} د.ع</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
