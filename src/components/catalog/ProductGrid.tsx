"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/catalog/ProductCard";

const SIDE_LEAVES = [
  { top: "8%", left: "-3%", size: 140, rotate: -15, speed: 0.18, opacity: 0.8 },
  { top: "36%", left: "97%", size: 110, rotate: 20, speed: -0.22, flip: true, opacity: 0.7 },
  { top: "62%", left: "-4%", size: 90, rotate: 8, speed: 0.3, opacity: 0.65 },
  { top: "88%", left: "95%", size: 130, rotate: -25, speed: -0.16, opacity: 0.75 },
];

export function ProductGrid({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leafRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [categoria, setCategoria] = useState<string>("Todos");

  const categorias = ["Todos", ...Array.from(new Set(products.map((p) => p.categoria)))];
  const visiveis =
    categoria === "Todos" ? products : products.filter((p) => p.categoria === categoria);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      leafRefs.current.forEach((leaf, i) => {
        if (!leaf) return;
        gsap.to(leaf, {
          yPercent: SIDE_LEAVES[i].speed * 100,
          rotate: `+=${SIDE_LEAVES[i].speed > 0 ? 20 : -20}`,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="catalogo" ref={sectionRef} className="relative overflow-hidden py-24">
      <div className="mx-auto mb-10 max-w-xl px-6 text-center">
        <h2 className="font-display text-4xl font-normal text-ink">Direto da horta</h2>
        <p className="mt-2 text-sm text-ink-soft">
          separadinho fresco pra você — clique em cada item pra saber mais
        </p>
      </div>

      <div className="relative z-10 mb-12 flex flex-wrap justify-center gap-2 px-6">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              categoria === c
                ? "border-leaf-deep bg-leaf-deep text-white"
                : "border-border bg-surface text-ink-soft hover:border-leaf"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {SIDE_LEAVES.map((leaf, i) => (
        <div
          key={i}
          ref={(el) => {
            leafRefs.current[i] = el;
          }}
          className="pointer-events-none absolute z-0 will-change-transform"
          style={{ top: leaf.top, left: leaf.left }}
          aria-hidden="true"
        >
          <Image
            src="/images/hero/folha.png"
            alt=""
            width={leaf.size}
            height={leaf.size}
            className="drop-shadow-[0_10px_18px_rgba(20,40,25,0.18)]"
            style={{
              height: "auto",
              opacity: leaf.opacity,
              transform: `rotate(${leaf.rotate}deg) scaleX(${leaf.flip ? -1 : 1})`,
            }}
          />
        </div>
      ))}

      <div className="relative z-10 mx-auto grid max-w-4xl grid-cols-2 gap-5 px-6 sm:grid-cols-3">
        {visiveis.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {visiveis.length === 0 && (
        <p className="relative z-10 mt-10 text-center text-sm text-ink-soft">
          Nada nessa categoria ainda.
        </p>
      )}
    </section>
  );
}
