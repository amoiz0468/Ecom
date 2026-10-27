import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductVariant } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWeightGrams: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: Product, variant: ProductVariant, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.variant_id === variant.id);

        if (existingIndex > -1) {
          const updated = [...items];
          const newQty = Math.min(
            updated[existingIndex].quantity + quantity,
            variant.stock
          );
          updated[existingIndex].quantity = newQty;
          set({ items: updated, isOpen: true });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}`,
            product_id: product.id,
            variant_id: variant.id,
            product,
            variant,
            quantity: Math.min(quantity, variant.stock),
          };
          set({ items: [...items, newItem], isOpen: true });
        }
      },

      removeItem: (variantId: string) => {
        set({ items: get().items.filter((i) => i.variant_id !== variantId) });
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        const updated = get().items.map((item) => {
          if (item.variant_id === variantId) {
            const cappedQty = Math.min(quantity, item.variant.stock);
            return { ...item, quantity: cappedQty };
          }
          return item;
        });

        set({ items: updated });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        );
      },

      getTotalWeightGrams: () => {
        return get().items.reduce(
          (weight, item) =>
            weight + (item.variant.weight_grams || 500) * item.quantity,
          0
        );
      },
    }),
    {
      name: "crockery_cart_storage",
    }
  )
);
