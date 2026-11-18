"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface RecentlyViewedState {
  items: Product[];
  recordView: (product: Product) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      recordView: (product) => {
        set((state) => ({
          items: [
            product,
            ...state.items.filter((p) => p.id !== product.id),
          ].slice(0, 8),
        }));
      },
    }),
    {
      name: "almoin-recently-viewed-storage",
    }
  )
);

