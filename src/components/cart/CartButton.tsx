"use client";

import { motion, AnimatePresence } from "motion/react";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/store/cart";

export function CartButton() {
  const items = useCart((s) => s.items);
  const toggle = useCart((s) => s.toggle);
  const count = items.reduce((n, i) => n + i.quantidade, 0);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Abrir carrinho"
      className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-leaf-deep text-white shadow-[0_16px_32px_-12px_rgba(20,40,25,0.5)] transition hover:scale-105"
    >
      <ShoppingBasket className="h-6 w-6" strokeWidth={2} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-leaf-bright text-xs font-bold text-hero-bg"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
