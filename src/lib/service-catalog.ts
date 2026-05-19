import { z } from "zod";

export type ServiceSlug =
  | "koshat"
  | "photography"
  | "albums"
  | "research"
  | "graduation"
  | "gifts"
  | "distributions";

export type ServiceFieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "date"
  | "time"
  | "file";

export interface ServiceFieldOption {
  value: string;
  label: string;
}

export interface ServiceField {
  name: string;
  label: string;
  type: ServiceFieldType;
  placeholder?: string;
  options?: ServiceFieldOption[];
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  wide?: boolean;
  helperText?: string;
}

export interface ServiceSection {
  title: string;
  description?: string;
  fields: ServiceField[];
}

export interface ServiceTrackingStep {
  id: "pending" | "booked" | "in_progress" | "editing" | "ready" | "delivered";
  label: string;
  description: string;
}

export interface ServiceGalleryItem {
  title: string;
  caption: string;
  image: string;
}

export interface ServiceReviewItem {
  name: string;
  text: string;
}

export interface ServiceDefinition {
  slug: ServiceSlug;
  serviceType: ServiceSlug;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  bannerText: string;
  icon: "sparkles" | "camera" | "album" | "file" | "graduation" | "gift";
  image: string;
  priceText: string;
  whatsappText: string;
  highlights: string[];
  sections: ServiceSection[];
  trackingSteps: ServiceTrackingStep[];
  gallery: ServiceGalleryItem[];
  reviews: ServiceReviewItem[];
  multiStep?: boolean;
}

const fileFields = ["referenceImages", "researchFiles", "photosUpload"];

const select = (values: string[]): ServiceFieldOption[] =>
  values.map((value) => ({ value, label: value }));

export const serviceCatalog: ServiceDefinition[] = [
  {
    slug: "koshat",
    serviceType: "koshat",
    title: "حجز الكوشات",
    shortTitle: "الكوشات",
    subtitle: "الكوشات والتنسيق",
    description: "تصميم وتنفيذ كوشات فاخرة حسب نوع المناسبة والمكان والألوان المطلوبة.",
    bannerText: "تفاصيل الحجز والتنفيذ",
    icon: "sparkles",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    priceText: "السعر حسب التفاصيل",
    whatsappText: "مرحباً، أريد حجز خدمة الكوشات من AJN.",
    highlights: ["تصميم حسب المناسبة", "ألوان وتنسيق مخصص", "تنفيذ داخلي وخارجي", "إمكانية إضافة صور مرجعية"],
    sections: [
      {
        title: "تفاصيل الكوشات",
        description: "كل التفاصيل اختيارية، وتساعدنا على تجهيز عرض أدق.",
        fields: [
          { name: "occasionType", label: "نوع المناسبة", type: "select", options: select(["زفاف", "خطوبة", "تخرج", "عيد ميلاد", "مناسبة خاصة"]) },
          { name: "koshaType", label: "نوع الكوشة", type: "select", options: select(["اعتيادي", "ملكي VIP", "حسب التصميم"]) },
          { name: "province", label: "المحافظة", type: "text", placeholder: "مثال: صلاح الدين" },
          { name: "address", label: "مكان المناسبة / العنوان", type: "textarea", placeholder: "اكتب العنوان أو اسم القاعة", wide: true },
          { name: "chairCount", label: "عدد الكراسي", type: "number", placeholder: "مثال: 20" },
          { name: "venueType", label: "داخلية / خارجية", type: "select", options: select(["داخلية", "خارجية"]) },
          { name: "colors", label: "الألوان المطلوبة", type: "text", placeholder: "ذهبي، أبيض، وردي..." },
          { name: "transferRequired", label: "النقل", type: "select", options: select(["مطلوب", "غير مطلوب"]) },
          { name: "referenceImages", label: "صور مرجعية", type: "file", accept: "image/*", multiple: true, helperText: "يمكن اختيار أكثر من صورة كمرجع للتصميم.", wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الطلب", description: "تم استلام تفاصيل الكوشة." },
      { id: "booked", label: "تثبيت الحجز", description: "تم تثبيت الموعد والمكان." },
      { id: "in_progress", label: "التجهيز", description: "الفريق يجهز التصميم والمواد." },
      { id: "editing", label: "اللمسات الأخيرة", description: "مراجعة الألوان والتفاصيل النهائية." },
      { id: "ready", label: "جاهزة للمناسبة", description: "الكوشة جاهزة للتنفيذ في الموقع." },
      { id: "delivered", label: "اكتمل التنفيذ", description: "تم تنفيذ الخدمة بنجاح." },
    ],
    gallery: [
      { title: "كوشة ملكية", caption: "تنسيق ذهبي بتفاصيل زهور ناعمة.", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80" },
      { title: "جلسة خطوبة", caption: "تصميم هادئ لمساحة داخلية.", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "أم محمد", text: "التنسيق كان مرتب والالتزام بالوقت ممتاز." },
      { name: "رنا", text: "الكوشة طلعت أفخم من الصورة المرجعية." },
    ],
  },
  {
    slug: "photography",
    serviceType: "photography",
    title: "طلب التصوير",
    shortTitle: "التصوير",
    subtitle: "جلسات وتصوير مناسبات",
    description: "جلسات داخلية وخارجية مع اختيار كادر التصوير ومدة الجلسة ونوع التغطية.",
    bannerText: "موعد وموقع وكادر التصوير",
    icon: "camera",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    priceText: "يبدأ من 50,000 د.ع",
    whatsappText: "مرحباً، أريد حجز جلسة تصوير من AJN.",
    highlights: ["داخلي أو خارجي", "صور أو فيديو", "اختيار كادر التصوير", "مراحل تتبع خاصة بالتصوير"],
    sections: [
      {
        title: "الكادر التصويري",
        fields: [
          { name: "photographyCrew", label: "كادر التصوير", type: "select", options: select(["احمد تحسين", "محمد ايدن", "احمد مراد", "حسن علي", "كرار محمد"]) },
          { name: "sessionDuration", label: "مدة الجلسة", type: "select", options: select(["ساعة واحدة", "ساعتان", "نصف يوم", "يوم كامل", "حسب الاتفاق"]) },
        ],
      },
      {
        title: "تفاصيل التصوير",
        fields: [
          { name: "sessionTime", label: "وقت الجلسة", type: "time" },
          { name: "shootingLocation", label: "موقع التصوير", type: "text", placeholder: "الاستوديو، قاعة، عنوان خارجي..." },
          { name: "sessionType", label: "نوع الجلسة", type: "select", options: select(["جلسة شخصية", "مناسبة", "تخرج", "عائلية", "منتجات", "حسب الطلب"]) },
          { name: "peopleCount", label: "عدد الأشخاص", type: "number", placeholder: "مثال: 4" },
          { name: "shootingMode", label: "داخلي / خارجي", type: "select", options: select(["داخلية", "خارجية"]) },
          { name: "coverageType", label: "صور / فيديو", type: "select", options: select(["صور فقط", "فيديو فقط", "صور وفيديو"]) },
          { name: "referenceImages", label: "صور مرجعية", type: "file", accept: "image/*", multiple: true, wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الطلب", description: "وصلت تفاصيل جلسة التصوير." },
      { id: "booked", label: "تثبيت الموعد", description: "تم تثبيت الكادر والوقت." },
      { id: "in_progress", label: "التصوير", description: "الجلسة قيد التنفيذ." },
      { id: "editing", label: "المونتاج", description: "الصور أو الفيديوهات قيد المعالجة." },
      { id: "ready", label: "جاهز للتسليم", description: "المواد جاهزة للمراجعة أو التسليم." },
      { id: "delivered", label: "تم التسليم", description: "تم تسليم ملفات التصوير." },
    ],
    gallery: [
      { title: "جلسة خارجية", caption: "إضاءة طبيعية وتكوينات هادئة.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80" },
      { title: "تغطية مناسبات", caption: "توثيق لحظات مهمة بتفاصيل دقيقة.", image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "حيدر", text: "الصور وصلت بسرعة والجودة ممتازة." },
      { name: "سارة", text: "الكادر متعاون والجلسة كانت مريحة." },
    ],
  },
  {
    slug: "albums",
    serviceType: "albums",
    title: "طلب الألبومات",
    shortTitle: "الألبومات",
    subtitle: "ألبومات وتصميم",
    description: "ألبومات فاخرة مع خيارات للغلاف والمقاس وعدد الصفحات واسم الغلاف.",
    bannerText: "نوع الألبوم والصفحات والغلاف",
    icon: "album",
    image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
    priceText: "السعر حسب عدد الصفحات والغلاف",
    whatsappText: "مرحباً، أريد طلب ألبوم من AJN.",
    highlights: ["حقول اختيارية بالكامل", "اختيار الغلاف والمقاس", "إضافة اسم على الغلاف", "رفع صور الألبوم"],
    sections: [
      {
        title: "تفاصيل الألبوم",
        description: "يمكن إرسال الطلب حتى لو تركت هذه الحقول فارغة.",
        fields: [
          { name: "albumType", label: "نوع الألبوم", type: "select", options: select(["فاخر", "كلاسيك", "زفاف", "تخرج", "عائلي", "حسب الطلب"]) },
          { name: "pageCount", label: "عدد الصفحات", type: "number", placeholder: "مثال: 20" },
          { name: "albumSize", label: "المقاس", type: "select", options: select(["20x30", "25x35", "30x40", "مقاس خاص"]) },
          { name: "coverType", label: "نوع الغلاف", type: "select", options: select(["جلد", "مخمل", "خشب", "أكريليك", "غلاف فاخر", "حسب الطلب"]) },
          { name: "coverName", label: "الاسم على الغلاف", type: "text", placeholder: "اختياري" },
          { name: "photosUpload", label: "رفع الصور", type: "file", accept: "image/*", multiple: true, wide: true },
          { name: "albumNotes", label: "ملاحظات الألبوم", type: "textarea", placeholder: "أي تفاصيل عن ترتيب الصور أو التصميم", wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الطلب", description: "تم استلام طلب الألبوم." },
      { id: "booked", label: "فرز الصور", description: "مراجعة الصور والتفاصيل." },
      { id: "in_progress", label: "التصميم", description: "تصميم صفحات الألبوم." },
      { id: "editing", label: "المراجعة", description: "مراجعة التصميم والغلاف." },
      { id: "ready", label: "جاهز للطباعة", description: "الألبوم جاهز للطباعة أو التجهيز." },
      { id: "delivered", label: "تم التسليم", description: "تم تسليم الألبوم." },
    ],
    gallery: [
      { title: "ألبوم فاخر", caption: "غلاف أنيق وصفحات مصممة بعناية.", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80" },
      { title: "ألبوم تخرج", caption: "ترتيب صور احترافي لذكرى تدوم.", image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "نور", text: "الألبوم مرتب والغلاف فخم جداً." },
      { name: "مريم", text: "أحببت طريقة تنسيق الصور والصفحات." },
    ],
  },
  {
    slug: "research",
    serviceType: "research",
    title: "طلب البحوث",
    shortTitle: "البحوث",
    subtitle: "كتابة وطباعة البحوث",
    description: "استقبال ملفات PDF وتفاصيل الجامعة والمشرف وخيارات الطباعة والتجليد.",
    bannerText: "ملفات وتجليد وموعد تسليم",
    icon: "file",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
    priceText: "السعر حسب الصفحات والتجليد",
    whatsappText: "مرحباً، أريد طلب خدمة بحث أو طباعة من AJN.",
    highlights: ["رفع ملفات PDF", "بيانات الطلبة والمشرف", "موعد تسليم واضح", "خيارات طباعة وتجليد"],
    sections: [
      {
        title: "تفاصيل البحث",
        fields: [
          { name: "researchTitle", label: "عنوان البحث", type: "text", placeholder: "عنوان البحث أو المشروع" },
          { name: "studentNames", label: "أسماء الطلبة", type: "textarea", placeholder: "اكتب الأسماء مفصولة بسطر أو فاصلة", wide: true },
          { name: "supervisor", label: "اسم المشرف", type: "text", placeholder: "اسم المشرف" },
          { name: "university", label: "الجامعة", type: "text", placeholder: "اسم الجامعة" },
          { name: "college", label: "الكلية", type: "text", placeholder: "اسم الكلية" },
          { name: "department", label: "القسم", type: "text", placeholder: "اسم القسم" },
          { name: "deliveryDeadline", label: "موعد التسليم", type: "date" },
        ],
      },
      {
        title: "الطباعة والتجليد",
        fields: [
          { name: "copies", label: "عدد النسخ", type: "number", placeholder: "مثال: 3" },
          { name: "printingType", label: "نوع الطباعة", type: "select", options: select(["طبع", "بدون طبع", "أسود وأبيض", "ملون"]) },
          { name: "bindingType", label: "تجليد أو تغليف", type: "select", options: select(["تجليد", "تغليف", "حلزوني", "فاخر", "بدون"]) },
          { name: "researchFiles", label: "رفع ملفات PDF", type: "file", accept: "application/pdf,.pdf", multiple: true, wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الملفات", description: "وصلت بيانات البحث والملفات." },
      { id: "booked", label: "مراجعة التفاصيل", description: "تدقيق المتطلبات وموعد التسليم." },
      { id: "in_progress", label: "قيد العمل", description: "الطباعة أو التحضير قيد التنفيذ." },
      { id: "editing", label: "التجليد", description: "التجليد أو التغليف قيد الإنجاز." },
      { id: "ready", label: "جاهز للاستلام", description: "البحث جاهز للاستلام." },
      { id: "delivered", label: "تم التسليم", description: "تم تسليم البحث." },
    ],
    gallery: [
      { title: "تجليد بحوث", caption: "تغليف مرتب وتجهيز نهائي.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80" },
      { title: "طباعة أكاديمية", caption: "ترتيب ملفات ونسخ حسب الطلب.", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "علي", text: "التسليم كان بنفس الموعد والتجليد ممتاز." },
      { name: "زينب", text: "سهولة إرسال الملفات والمتابعة واضحة." },
    ],
  },
  {
    slug: "graduation",
    serviceType: "graduation",
    title: "طلب تجهيزات التخرج",
    shortTitle: "تجهيزات التخرج",
    subtitle: "روب ووشاح وتفاصيل القياس",
    description: "طلب روب ووشاح وقبعة مع خيارات الطباعة أو التطريز والقياسات.",
    bannerText: "قياسات وخيارات التخرج",
    icon: "graduation",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    priceText: "يبدأ من 35,000 د.ع",
    whatsappText: "مرحباً، أريد طلب تجهيزات تخرج من AJN.",
    highlights: ["فورم متعدد الخطوات", "قياسات مفصلة", "طباعة أو تطريز", "روب ووشاح وقبعة"],
    multiStep: true,
    sections: [
      {
        title: "الموقع والموعد",
        fields: [
          { name: "province", label: "المحافظة", type: "text", placeholder: "المحافظة" },
          { name: "address", label: "العنوان", type: "textarea", placeholder: "العنوان أو مكان الاستلام", wide: true },
          { name: "graduationTime", label: "وقت الحجز", type: "time" },
        ],
      },
      {
        title: "تفاصيل التخرج",
        fields: [
          { name: "packageType", label: "نوع التجهيز", type: "select", options: select(["الاعتيادي", "الملكي", "الأمريكي"]) },
          { name: "sashType", label: "نوع الوشاح", type: "select", options: select(["عادي", "ملكي", "امريكي"]) },
          { name: "robeType", label: "نوع الروب", type: "select", options: select(["انكليزي", "عربي", "حسب الطلب"]) },
          { name: "writingType", label: "الطباعة أو التطريز", type: "select", options: select(["طبع", "تطريز", "بدون"]) },
          { name: "capOption", label: "القبعة", type: "select", options: select(["مضافة", "غير مضافة"]) },
          { name: "graduationDetails", label: "تفاصيل التخرج كاملة", type: "textarea", placeholder: "اسم الجامعة، الدفعة، النص المطلوب...", wide: true },
        ],
      },
      {
        title: "القياسات والصور",
        fields: [
          { name: "sashLength", label: "طول الوشاح", type: "text", placeholder: "مثال: 160 سم" },
          { name: "shoulder", label: "الكتف", type: "text", placeholder: "مثال: 44 سم" },
          { name: "robeLength", label: "طول الروب", type: "text", placeholder: "مثال: 140 سم" },
          { name: "sleeve", label: "اليد", type: "text", placeholder: "مثال: 60 سم" },
          { name: "referenceImages", label: "صور مرجعية", type: "file", accept: "image/*", multiple: true, wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الطلب", description: "وصلت تفاصيل تجهيزات التخرج." },
      { id: "booked", label: "تأكيد القياسات", description: "مراجعة المقاسات وخيارات الروب." },
      { id: "in_progress", label: "التجهيز", description: "الخياطة أو التجهيز قيد التنفيذ." },
      { id: "editing", label: "الطباعة/التطريز", description: "إضافة النصوص والتفاصيل النهائية." },
      { id: "ready", label: "جاهز للاستلام", description: "التجهيزات جاهزة." },
      { id: "delivered", label: "تم التسليم", description: "تم تسليم تجهيزات التخرج." },
    ],
    gallery: [
      { title: "روب تخرج", caption: "قصات مرتبة للدفعات والطلاب.", image: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=900&q=80" },
      { title: "وشاح مطرز", caption: "تفاصيل اسمية حسب الطلب.", image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "مصطفى", text: "القياسات مضبوطة والوشاح طلع مرتب." },
      { name: "شهد", text: "التطريز واضح والتسليم سريع." },
    ],
  },
  {
    slug: "gifts",
    serviceType: "gifts",
    title: "طلب الهدايا",
    shortTitle: "الهدايا",
    subtitle: "هدايا وتغليف",
    description: "هدايا بتغليف فاخر حسب المناسبة مع كارت إهداء وعنوان توصيل.",
    bannerText: "نوع الهدية والعنوان والمناسبة",
    icon: "gift",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80",
    priceText: "يبدأ من 25,000 د.ع",
    whatsappText: "مرحباً، أريد طلب هدية من AJN.",
    highlights: ["تغليف حسب المناسبة", "كارت إهداء", "عنوان توصيل", "تصميم هدية مخصص"],
    sections: [
      {
        title: "تفاصيل الهدية",
        fields: [
          { name: "province", label: "المحافظة", type: "text", placeholder: "المحافظة" },
          { name: "address", label: "عنوان التوصيل", type: "textarea", placeholder: "العنوان التفصيلي", wide: true },
          { name: "giftType", label: "نوع الهدية", type: "select", options: select(["بوكس هدية", "ورد", "عطر", "هدية تخرج", "هدية مخصصة"]) },
          { name: "wrapping", label: "التغليف", type: "select", options: select(["تغليف فاخر", "تغليف كلاسيك", "بدون تغليف", "حسب المناسبة"]) },
          { name: "occasion", label: "المناسبة", type: "select", options: select(["عيد ميلاد", "تخرج", "خطوبة", "زفاف", "شكر", "مناسبة خاصة"]) },
          { name: "recipientName", label: "اسم المستلم", type: "text", placeholder: "اختياري" },
          { name: "occasionDate", label: "تاريخ المناسبة", type: "date" },
          { name: "giftCard", label: "كارت الإهداء", type: "textarea", placeholder: "اكتب رسالة الإهداء", wide: true },
          { name: "referenceImages", label: "صور مرجعية", type: "file", accept: "image/*", multiple: true, wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الطلب", description: "وصلت تفاصيل الهدية." },
      { id: "booked", label: "تأكيد الهدية", description: "تثبيت نوع الهدية والتغليف." },
      { id: "in_progress", label: "التجهيز", description: "تجهيز الهدية والكارت." },
      { id: "editing", label: "التغليف", description: "التغليف النهائي قيد الإنجاز." },
      { id: "ready", label: "جاهزة للتوصيل", description: "الهدية جاهزة للتوصيل أو الاستلام." },
      { id: "delivered", label: "تم التسليم", description: "تم تسليم الهدية." },
    ],
    gallery: [
      { title: "بوكس هدية", caption: "تغليف فاخر مع رسالة خاصة.", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80" },
      { title: "هدية مناسبة", caption: "اختيار وتنسيق حسب ذوق العميل.", image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "داليا", text: "التغليف راقي ووصلت الهدية بالوقت." },
      { name: "كرار", text: "الكارت والتفاصيل كانت مثل ما طلبت." },
    ],
  },
  {
    slug: "distributions",
    serviceType: "distributions",
    title: "طلب التوزيعات",
    shortTitle: "التوزيعات",
    subtitle: "توزيعات مناسبات",
    description: "توزيعات أنيقة للمناسبات مع خيارات الكمية واللون والتغليف.",
    bannerText: "توزيعات حسب المناسبة",
    icon: "gift",
    image: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80",
    priceText: "السعر حسب الكمية",
    whatsappText: "مرحباً، أريد طلب توزيعات من AJN.",
    highlights: ["كمية حسب الطلب", "تغليف خاص", "ألوان مخصصة", "تنفيذ للمناسبات"],
    sections: [
      {
        title: "تفاصيل التوزيعات",
        fields: [
          { name: "distributionType", label: "نوع التوزيعات", type: "text", placeholder: "مثال: تخرج، خطوبة، مواليد" },
          { name: "quantity", label: "الكمية", type: "number", placeholder: "مثال: 100" },
          { name: "colors", label: "الألوان", type: "text", placeholder: "الألوان المطلوبة" },
          { name: "wrapping", label: "التغليف", type: "select", options: select(["فاخر", "كلاسيك", "بسيط", "حسب الطلب"]) },
          { name: "referenceImages", label: "صور مرجعية", type: "file", accept: "image/*", multiple: true, wide: true },
        ],
      },
    ],
    trackingSteps: [
      { id: "pending", label: "استلام الطلب", description: "وصلت تفاصيل التوزيعات." },
      { id: "booked", label: "تثبيت التصميم", description: "تأكيد الكمية والألوان." },
      { id: "in_progress", label: "التجهيز", description: "التوزيعات قيد التنفيذ." },
      { id: "editing", label: "التغليف", description: "التغليف والفرز قيد الإنجاز." },
      { id: "ready", label: "جاهزة", description: "التوزيعات جاهزة للاستلام." },
      { id: "delivered", label: "تم التسليم", description: "تم تسليم التوزيعات." },
    ],
    gallery: [
      { title: "توزيعات فاخرة", caption: "قطع صغيرة بتغليف مرتب.", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80" },
      { title: "توزيعات تخرج", caption: "تصميم حسب هوية المناسبة.", image: "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=900&q=80" },
    ],
    reviews: [
      { name: "أحمد", text: "التوزيعات مرتبة والكمية كاملة." },
      { name: "هبة", text: "التغليف كان أنيق ومناسب للحفل." },
    ],
  },
];

export const primaryServiceCatalog = serviceCatalog.filter((service) => service.slug !== "distributions");

export const serviceStatusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  booked: "محجوز",
  in_progress: "قيد التنفيذ",
  editing: "قيد التجهيز النهائي",
  ready: "جاهز",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export function getServiceBySlug(slug?: string | null): ServiceDefinition | undefined {
  return serviceCatalog.find((service) => service.slug === slug);
}

export function getServiceName(slug?: string | null): string {
  return getServiceBySlug(slug)?.shortTitle ?? slug ?? "خدمة";
}

export function getServiceTrackingSteps(slug?: string | null): ServiceTrackingStep[] {
  return getServiceBySlug(slug)?.trackingSteps ?? serviceCatalog[0].trackingSteps;
}

export function formatServiceRequestTrackingCode(id?: number | string | null): string {
  return id === undefined || id === null || id === "" ? "SR-0000" : `SR-${id}`;
}

export function buildServiceWhatsAppUrl(service: ServiceDefinition, trackingCode?: string): string {
  const suffix = trackingCode ? `\nرقم الطلب: ${trackingCode}` : "";
  return `https://wa.me/9647725762520?text=${encodeURIComponent(`${service.whatsappText}${suffix}`)}`;
}

export function buildServiceRequestSchema(service: ServiceDefinition) {
  const optionalText = z.string().trim().optional().or(z.literal(""));
  const fieldShape = service.sections
    .flatMap((section) => section.fields)
    .reduce<Record<string, z.ZodTypeAny>>((shape, field) => {
      if (fileFields.includes(field.name) || field.type === "file") {
        shape[field.name] = z.any().optional();
        return shape;
      }

      shape[field.name] = field.required
        ? z.string().trim().min(1, `${field.label} مطلوب`)
        : optionalText;
      return shape;
    }, {});

  return z.object({
    customerName: z.string().trim().min(2, "اسم الزبون مطلوب"),
    customerPhone: z.string().trim().min(7, "رقم الهاتف مطلوب"),
    eventDate: optionalText,
    eventTime: optionalText,
    notes: optionalText,
    ...fieldShape,
  });
}

export type ServiceFormValues = {
  customerName: string;
  customerPhone: string;
  eventDate?: string;
  eventTime?: string;
  notes?: string;
  [key: string]: unknown;
};

export function getServiceFields(service: ServiceDefinition): ServiceField[] {
  return service.sections.flatMap((section) => section.fields);
}

export function normalizeServiceDetails(details: unknown): Record<string, unknown> {
  if (!details || typeof details !== "object" || Array.isArray(details)) return {};
  return details as Record<string, unknown>;
}

function formatDetailValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object" && "name" in item) {
          return String((item as { name?: unknown }).name ?? "");
        }
        return String(item);
      })
      .filter(Boolean)
      .join("، ");
  }
  if (typeof value === "object") return "";
  return String(value);
}

export function getServiceDetailPairs(slug: string | undefined, details: unknown) {
  const service = getServiceBySlug(slug);
  const normalized = normalizeServiceDetails(details);
  if (!service) return [];

  return getServiceFields(service)
    .map((field) => ({
      key: field.name,
      label: field.label,
      value: formatDetailValue(normalized[field.name]),
    }))
    .filter((item) => item.value.length > 0);
}
