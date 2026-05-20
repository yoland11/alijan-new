import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const services = [
  { id: "koshat", name: "كوشات", description: "تصميم وتنفيذ أرقى الكوشات لمناسباتكم", icon: "✨", link: "/services/koshat" },
  { id: "photography", name: "تصوير", description: "توثيق لحظاتكم بأجمل الصور والفيديوهات", icon: "📸", link: "/services/photography" },
  { id: "albums", name: "ألبومات", description: "ألبومات فاخرة لحفظ ذكرياتكم", icon: "📖", link: "/services/albums" },
  { id: "graduation", name: "تخرج", description: "تجهيزات متكاملة لحفلات التخرج", icon: "🎓", link: "/services/graduation" },
  { id: "research", name: "بحوث", description: "طباعة وتغليف البحوث الجامعية", icon: "📝", link: "/services/research" },
  { id: "distributions", name: "توزيعات", description: "توزيعات أنيقة تناسب جميع المناسبات", icon: "🎁", link: "/services/distributions" },
  { id: "gifts", name: "هدايا", description: "هدايا فاخرة لمن تحبون", icon: "💝", link: "/services/gifts" },
];

export default function Services() {
  return (
    <div className="py-20 px-4 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">خدماتنا</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          نقدم مجموعة متكاملة من الخدمات الفاخرة لتلبية جميع احتياجات مناسباتكم بأعلى معايير الجودة
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={service.link}
              className="block group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="text-4xl mb-6">{service.icon}</div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{service.name}</h3>
              <p className="text-muted-foreground mb-8">{service.description}</p>
              <div className="flex items-center text-primary font-medium group-hover:translate-x-[-10px] transition-transform">
                <span>اطلب الخدمة</span>
                <ArrowLeft className="w-5 h-5 mr-2" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}