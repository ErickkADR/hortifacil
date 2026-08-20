"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";

export type CartItem = {
  product: Product;
  quantidade: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product) => void;
  addQuantity: (product: Product, quantidade: number) => void;
  remove: (productId: string) => void;
  setQuantidade: (productId: string, quantidade: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantidade: i.quantidade + 1 }
                  : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { product, quantidade: 1 }], isOpen: true };
        }),
      addQuantity: (product, quantidade) =>
        set((state) => {
          if (quantidade <= 0) return state;
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantidade: i.quantidade + quantidade }
                  : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { product, quantidade }], isOpen: true };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
      setQuantidade: (productId, quantidade) =>
        set((state) => ({
          items:
            quantidade <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantidade } : i,
                ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: "hortifacil-carrinho", partialize: (state) => ({ items: state.items }) },
  ),
);

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.product.preco * item.quantidade, 0);
}
