"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface WishlistState {
  items: Product[];
  isOpen: boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      toggleWishlist: (product) => {
        const exists = get().items.some((p) => p.id === product.id);
        set((state) => ({
          items: exists
            ? state.items.filter((p) => p.id !== product.id)
            : [product, ...state.items].slice(0, 40),
        }));
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
      },

      isInWishlist: (productId) =>
        get().items.some((p) => p.id === productId),

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "almoin-wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

