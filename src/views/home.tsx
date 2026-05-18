import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Phone, MessageCircle } from "lucide-react";
import { useListProducts, useListServices } from "@workspace/api-client-react";
import { toSafeArray } from "@/lib/to-safe-array";

const services = [
  { id: "koshat", name: "كوشات", description: "تصميم وتنفيذ أرقى الكوشات لمناسباتكم", icon: "✨" },
  { id: "photography", name: "تصوير", description: "توثيق لحظاتكم بأجمل الصور", icon: "📸" },
  { id: "albums", name: "ألبومات", description: "ألبومات فاخرة لحفظ ذكرياتكم", icon: "📖" },
  { id: "graduation", name: "تخرج", description: "تجهيزات متكاملة لحفلات التخرج", icon: "🎓" },
  { id: "research", name: "بحوث", description: "طباعة وتغليف البحوث الجامعية", icon: "📝" },
  { id: "distributions", name: "توزيعات", description: "توزيعات أنيقة لجميع المناسبات", icon: "🎁" },
];

const testimonials = [
  { name: "أم علي", text: "خدمة رائعة وتعامل راقي، الكوشة كانت أجمل من المتوقع", rating: 5 },
  { name: "محمد أحمد", text: "ألبوم الزفاف جاء خيالي، شكراً لفريق علي جان", rating: 5 },
  { name: "سارة كريم", text: "تجهيزات التخرج كانت رائعة، كل شيء كان منظماً ومرتباً", rating: 5 },
];

export default function Home() {
  const { data: products } = useListProducts({ limit: 4 });
  const safeProducts = toSafeArray<any>(products);

  return (
    <div className="flex-1">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6">
              مجموعة علي جان الفاخرة
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight mb-8">
              الفخامة في
              <span className="text-primary block">كل تفصيلة</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              نقدم تجربة فريدة من الخدمات الراقية والمنتجات المتميزة لتجعل مناسباتكم لا تُنسى
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/services"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-md font-bold text-lg hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto"
              >
                استكشف خدماتنا
              </Link>
              <Link
                to="/store"
                className="bg-transparent border border-primary/50 text-foreground px-10 py-4 rounded-md font-bold text-lg hover:border-primary hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto"
              >
                تصفح المتجر
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            {[["500+", "مناسبة ناجحة"], ["7", "خدمات متخصصة"], ["100%", "رضا الزبائن"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-primary">{num}</p>
                <p className="mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">خدماتنا المتميزة</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              نغطي احتياجاتكم من البداية إلى النهاية بأعلى معايير الجودة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/services/${s.id}`}
                  className="block group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="text-4xl mb-5">{s.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{s.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{s.description}</p>
                  <span className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-4 transition-all">
                    اطلب الآن
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {safeProducts.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-16"
            >
              <div>
                <h2 className="text-4xl font-bold mb-4">منتجات مختارة</h2>
                <p className="text-muted-foreground">تشكيلة فاخرة من أجمل المنتجات</p>
              </div>
              <Link to="/store" className="text-primary font-medium hover:underline flex items-center gap-2">
                عرض الكل <ArrowLeft className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeProducts.map((p, i) => {
                const productImages = toSafeArray<string>(p?.images);
                return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/store/${p.id}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-500">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {productImages[0] ? (
                        <img src={productImages[0]} alt={p.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🛍</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{p.nameAr}</h3>
                      <p className="text-primary font-bold">{Number(p.price ?? 0).toLocaleString("ar-IQ")} د.ع</p>
                    </div>
                  </Link>
                </motion.div>
              );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">ماذا يقول زبائننا</h2>
            <p className="text-muted-foreground">آراء حقيقية من زبائننا الكرام</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <p className="font-bold text-primary">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-primary/20 rounded-3xl p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4 text-primary">تواصل معنا</h2>
            <p className="text-muted-foreground text-lg mb-8">
              نحن هنا لمساعدتكم في تحقيق مناسبتكم الحلم. تواصلوا معنا الآن!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/9647725762520"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-md font-bold hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-5 h-5" />
                واتساب
              </a>
              <a
                href="tel:07729000122"
                className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-md font-bold hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
              >
                <Phone className="w-5 h-5" />
                07729000122
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
