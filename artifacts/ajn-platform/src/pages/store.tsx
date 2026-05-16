import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useListProducts } from "@workspace/api-client-react";
import { ShoppingBag, Star, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toSafeArray } from "@/lib/to-safe-array";

export default function Store() {
  const { data: products, isLoading } = useListProducts();
  const safeProducts = toSafeArray<any>(products);

  return (
    <div className="py-20 px-4 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">المتجر</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          تسوق من تشكيلتنا الفاخرة المنتقاة بعناية لتناسب ذوقك الرفيع
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
              <Skeleton className="w-full aspect-[4/5]" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : safeProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {safeProducts.map((product, index) => {
            const productImages = toSafeArray<string>(product?.images);
            return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500"
            >
              <Link to={`/store/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-muted">
                {productImages[0] ? (
                  <img
                    src={productImages[0]}
                    alt={product.nameAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 opacity-20" />
                  </div>
                )}
                {product.discountPrice && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
                    تخفيض
                  </div>
                )}
              </Link>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/store/${product.id}`}>
                    <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-1">{product.nameAr}</h3>
                  </Link>
                  {product.averageRating && (
                    <div className="flex items-center text-amber-500 text-sm">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {product.averageRating.toFixed(1)}
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.descriptionAr}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    {product.discountPrice ? (
                      <>
                        <span className="text-sm text-muted-foreground line-through">{Number(product.price ?? 0).toLocaleString("ar-IQ")} د.ع</span>
                        <span className="text-lg font-bold text-primary">{Number(product.discountPrice ?? 0).toLocaleString("ar-IQ")} د.ع</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-primary">{Number(product.price ?? 0).toLocaleString("ar-IQ")} د.ع</span>
                    )}
                  </div>
                  
                  <Link
                    to={`/store/${product.id}`}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl">لا توجد بيانات</p>
        </div>
      )}
    </div>
  );
}
