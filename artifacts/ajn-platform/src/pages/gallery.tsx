import { useState } from "react";
import { useListGallery, type GalleryItem } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toSafeArray } from "@/lib/to-safe-array";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: galleryData, isLoading } = useListGallery();
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const safeGalleryItems = toSafeArray<GalleryItem>(galleryData);

  const categories = ["all", "koshat", "photography", "events"];
  const categoryLabels: Record<string, string> = {
    all: "الكل",
    koshat: "كوشات",
    photography: "تصوير",
    events: "مناسبات"
  };

  const filteredItems = safeGalleryItems.filter(
    item => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">أعمالنا</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          تصفح معرض أعمالنا واستلهم أفكاراً لمناسبتك القادمة. كل صورة تروي قصة نجاح وإبداع.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card border border-border text-foreground hover:border-primary/50"
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className={`w-full rounded-2xl ${i % 2 === 0 ? 'h-64' : 'h-96'}`} />
          ))}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className="relative break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer border border-border"
                onClick={() => setPreviewItem(item)}
              >
                {item.type === "video" ? (
                  <div className="relative aspect-[9/16] bg-muted">
                    {item.thumbnailUrl && (
                      <img src={item.thumbnailUrl} alt={item.titleAr || "Video"} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground backdrop-blur-sm">
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.titleAr || "Gallery image"} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                
                {item.titleAr && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-bold text-lg">{item.titleAr}</h3>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center py-24 text-muted-foreground">
          لا توجد بيانات
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4"
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-card/50 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            >
              {previewItem.type === "video" ? (
                <video src={previewItem.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
              ) : (
                <img src={previewItem.url} alt={previewItem.titleAr ?? "Gallery image"} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
