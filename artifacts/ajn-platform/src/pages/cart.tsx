import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { toSafeArray } from "@/lib/to-safe-array";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();
  const safeItems = toSafeArray<CartItem>(items);

  if (safeItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag className="w-20 h-20 text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-bold text-muted-foreground">السلة فارغة</h2>
        <p className="text-muted-foreground">لم تضف أي منتجات بعد</p>
        <Link
          to="/store"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
        >
          تصفح المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 container mx-auto max-w-5xl">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-primary mb-12"
      >
        سلة التسوق
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {safeItems.map((item, i) => (
            <motion.div
              key={`${item.productId}-${item.color}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-6 flex gap-6"
            >
              {item.image && (
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                {item.color && (
                  <p className="text-sm text-muted-foreground mb-3">اللون: {item.color}</p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.color, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.color, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.productId, item.color)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <p className="font-bold text-primary text-lg">
                  {(item.price * item.quantity).toLocaleString("ar-IQ")} د.ع
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 sticky top-24"
          >
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">ملخص الطلب</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{total.toLocaleString("ar-IQ")} د.ع</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>التوصيل</span>
                <span>يحدد لاحقاً</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-4 mb-6">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toLocaleString("ar-IQ")} د.ع</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold text-lg hover:opacity-90 transition-opacity"
            >
              متابعة الطلب
            </button>
            <Link
              to="/store"
              className="flex items-center justify-center gap-2 mt-4 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              متابعة التسوق
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
