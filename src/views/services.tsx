import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  Camera,
  FileText,
  Gift,
  GraduationCap,
  Images,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  buildServiceWhatsAppUrl,
  primaryServiceCatalog,
  serviceCatalog,
  type ServiceDefinition,
} from "@/lib/service-catalog";

const serviceIcons: Record<ServiceDefinition["icon"], ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  camera: Camera,
  album: Images,
  file: FileText,
  graduation: GraduationCap,
  gift: Gift,
};

export default function Services() {
  const extraServices = serviceCatalog.filter((service) => service.slug === "distributions");

  return (
    <div className="py-16 px-4 container mx-auto">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card mb-14"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/86 to-background/40" />
        </div>
        <div className="relative z-10 max-w-3xl p-7 sm:p-10 lg:p-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            خدمات AJN
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-5">
            خدمات فاخرة بتفاصيل مختلفة لكل مناسبة
          </h1>
          <p className="text-muted-foreground text-lg leading-8">
            تم تجهيز خدمات الكوشات والتصوير والألبومات والبحوث والتخرج والهدايا بتفاصيلها الخاصة، مع حجز واضح ومراحل متابعة تناسب كل خدمة.
          </p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {primaryServiceCatalog.map((service, index) => {
          const Icon = serviceIcons[service.icon];

          return (
            <motion.article
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/10"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading={index > 1 ? "lazy" : "eager"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
                <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-background/75 text-primary backdrop-blur">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="absolute bottom-5 right-5 left-5">
                  <p className="mb-2 text-sm font-semibold text-primary">{service.subtitle}</p>
                  <h2 className="text-3xl font-bold text-white">{service.title}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-muted-foreground leading-7">{service.description}</p>
                  <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                    {service.priceText}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.highlights.slice(0, 4).map((item) => (
                    <div key={item} className="rounded-xl border border-border bg-background/45 px-4 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {service.gallery.slice(0, 2).map((item) => (
                    <div key={item.title} className="overflow-hidden rounded-xl border border-border bg-background">
                      <img src={item.image} alt={item.title} className="h-28 w-full object-cover" loading="lazy" />
                      <p className="px-3 py-2 text-xs font-medium text-muted-foreground">{item.title}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    احجز الآن
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <a
                    href={buildServiceWhatsAppUrl(service)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-5 py-3 font-bold transition-colors hover:border-primary hover:text-primary"
                  >
                    واتساب مباشر
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {extraServices.length > 0 && (
        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-2xl font-bold text-primary">خدمات إضافية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extraServices.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="flex items-center justify-between rounded-xl border border-border bg-background/45 p-5 transition-colors hover:border-primary/50"
              >
                <div>
                  <p className="font-bold">{service.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                </div>
                <ArrowLeft className="h-5 w-5 text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
