import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variationId?: string;
  attributes?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  removeItem: (productId: string, variationId?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        set((state) => {
          // Match by productId AND variationId (if both have variations)
          const existing = state.items.find((i) => {
            if (i.productId !== item.productId) return false;
            if (i.variationId && item.variationId) {
              return i.variationId === item.variationId;
            }
            if (!i.variationId && !item.variationId) {
              return true; // Both non-variation, same product
            }
            return false; // One has variation, one doesn't - different items
          });
          if (existing) {
            return {
              items: state.items.map((i) => {
                const matches = i.productId === item.productId &&
                  ((i.variationId && item.variationId && i.variationId === item.variationId) ||
                   (!i.variationId && !item.variationId));
                return matches ? { ...i, quantity: i.quantity + qty } : i;
              }),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        });
      },
      updateQuantity: (productId, quantity, variationId?: string) => {
        if (quantity < 1) {
          get().removeItem(productId, variationId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            const matches = i.productId === productId &&
              ((variationId && i.variationId === variationId) || (!variationId && !i.variationId));
            return matches ? { ...i, quantity } : i;
          }),
        }));
      },
      removeItem: (productId, variationId?: string) => {
        set((state) => ({
          items: state.items.filter((i) => {
            if (i.productId !== productId) return true;
            if (variationId && i.variationId) return i.variationId !== variationId;
            if (!variationId && !i.variationId) return false;
            return true; // Keep if one has variation and one doesn't
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "velvety-cart" }
  )
);
