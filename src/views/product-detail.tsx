import { useParams, Link } from "react-router-dom";
import {
  getListProductsQueryKey,
  useGetProduct,
  useListProducts,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { toSafeArray } from "@/lib/to-safe-array";
import { useCartStore } from "@/lib/cart-store";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useGetProduct(productId);
  const productAny = product as any;
  const relatedParams = productAny?.category ? { category: productAny.category } : undefined;
  const { data: relatedProducts } = useListProducts(relatedParams, {
    query: {
      queryKey: getListProductsQueryKey(relatedParams),
      enabled: Boolean(relatedParams),
    },
  });

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const safeImages = toSafeArray<string>(productAny?.images);
  const safeColors = toSafeArray<any>(productAny?.colors);
  const safeRelatedProducts = toSafeArray<any>(relatedProducts).filter(
    (related) => related?.id !== productAny?.id,
  );

  const handleAddToCart = () => {
    if (!product) return;

    if (safeColors.length > 0 && !selectedColor) {
      toast.error("يرجى اختيار اللون أولاً");
      return;
    }

    addItem({
      productId: product.id,
      name: product.nameAr,
      price: Number(product.discountPrice ?? product.price ?? 0),
      quantity,
      color: selectedColor ?? undefined,
      image: safeImages[0],
    });

    toast.success("تم إضافة المنتج إلى السلة بنجاح");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">المنتج غير موجود</h2>
        <Link to="/store" className="text-muted-foreground hover:text-primary transition-colors">
          العودة إلى المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border">
            {safeImages.length > 0 ? (
              <img src={safeImages[0]} alt={product.nameAr} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">لا توجد صورة</div>
            )}
          </div>
          {safeImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {safeImages.map((img, i) => (
                <button key={i} className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                  <img src={img} alt={`${product.nameAr} - صورة ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-foreground mb-4">{product.nameAr}</h1>
          
          {product.averageRating && (
            <div className="flex items-center gap-2 text-amber-500 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(Number(product.averageRating ?? 0)) ? 'fill-current' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewCount} تقييم)</span>
            </div>
          )}

          <div className="text-3xl font-bold text-primary mb-8">
            {product.discountPrice ? (
              <div className="flex items-center gap-4">
                <span>{Number(product.discountPrice).toLocaleString("ar-IQ")} د.ع</span>
                <span className="text-xl text-muted-foreground line-through">{Number(product.price ?? 0).toLocaleString("ar-IQ")} د.ع</span>
              </div>
            ) : (
              <span>{Number(product.price ?? 0).toLocaleString("ar-IQ")} د.ع</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
            {product.descriptionAr}
          </p>

          {safeColors.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-4">اللون</h3>
              <div className="flex flex-wrap gap-3">
                {safeColors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.name ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <div className="flex items-center justify-between border border-border rounded-md px-4 py-3 sm:w-32 bg-card">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-muted-foreground hover:text-primary transition-colors">
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-muted-foreground hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-md font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.inStock ? "أضف إلى السلة" : "نفذت الكمية"}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {safeRelatedProducts.length > 0 && (
        <div className="border-t border-border pt-16">
          <h2 className="text-3xl font-bold mb-8">منتجات مشابهة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {safeRelatedProducts.slice(0, 4).map(related => {
              const relatedImages = toSafeArray<string>(related?.images);
              return (
              <Link key={related.id} to={`/store/${related.id}`} className="group">
                <div className="aspect-[4/5] bg-muted rounded-xl overflow-hidden border border-border mb-4">
                  {relatedImages[0] && (
                    <img src={relatedImages[0]} alt={related.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{related.nameAr}</h3>
                <p className="text-primary font-bold">{Number(related.discountPrice || related.price || 0).toLocaleString("ar-IQ")} د.ع</p>
              </Link>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
