import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toSafeArray } from "@/lib/to-safe-array";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  colorHex?: string;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, color?: string) => void;
  updateQuantity: (productId: number, color: string | undefined, qty: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      get total() {
        return toSafeArray<CartItem>(get().items).reduce(
          (acc, i) => acc + Number(i?.price ?? 0) * Number(i?.quantity ?? 0),
          0,
        );
      },
      addItem: (item) => {
        set((s) => {
          const items = toSafeArray<CartItem>(s.items);
          const existing = items.find(
            (i) => i.productId === item.productId && i.color === item.color
          );
          if (existing) {
            return {
              items: items.map((i) =>
                i.productId === item.productId && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...items, item] };
        });
      },
      removeItem: (productId, color) => {
        set((s) => ({
          items: toSafeArray<CartItem>(s.items).filter(
            (i) => !(i.productId === productId && i.color === color)
          ),
        }));
      },
      updateQuantity: (productId, color, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, color);
          return;
        }
        set((s) => ({
          items: toSafeArray<CartItem>(s.items).map((i) =>
            i.productId === productId && i.color === color
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "ajn-cart",
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CartStore> | undefined;
        return {
          ...current,
          items: toSafeArray<CartItem>(persistedState?.items),
        };
      },
    }
  )
);
