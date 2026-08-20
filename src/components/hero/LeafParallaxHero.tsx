"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LeafSpec = {
  top: string;
  left: string;
  size: number;
  rotate: number;
  opacity: number;
  flip?: boolean;
};

const BACK_LEAVES: LeafSpec[] = [
  { top: "4%", left: "-4%", size: 220, rotate: -18, opacity: 0.55 },
  { top: "10%", left: "2%", size: 150, rotate: -60, opacity: 0.4 },
  { top: "58%", left: "88%", size: 260, rotate: 24, opacity: 0.5, flip: true },
  { top: "70%", left: "94%", size: 160, rotate: 70, opacity: 0.35, flip: true },
  { top: "78%", left: "2%", size: 180, rotate: 8, opacity: 0.45 },
];

const MID_LEAVES: LeafSpec[] = [
  { top: "14%", left: "78%", size: 200, rotate: -30, opacity: 0.7 },
  { top: "24%", left: "86%", size: 130, rotate: 20, opacity: 0.5, flip: true },
  { top: "62%", left: "-6%", size: 240, rotate: 20, opacity: 0.65 },
  { top: "72%", left: "-2%", size: 140, rotate: -40, opacity: 0.5 },
  { top: "-2%", left: "38%", size: 150, rotate: 60, opacity: 0.55 },
];

const FRONT_LEAVES: LeafSpec[] = [
  { top: "70%", left: "70%", size: 200, rotate: -12, opacity: 0.92, flip: true },
  { top: "82%", left: "80%", size: 130, rotate: 35, opacity: 0.8 },
  { top: "-6%", left: "8%", size: 190, rotate: 40, opacity: 0.9 },
  { top: "2%", left: "18%", size: 120, rotate: -25, opacity: 0.75, flip: true },
  { top: "40%", left: "94%", size: 170, rotate: -50, opacity: 0.85 },
];

function LeafLayer({
  leaves,
  className,
  filter,
}: {
  leaves: LeafSpec[];
  className?: string;
  filter: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      {leaves.map((leaf, i) => (
        <Image
          key={i}
          src="/images/hero/folha.png"
          alt=""
          width={leaf.size}
          height={leaf.size}
          className="absolute"
          style={{
            top: leaf.top,
            left: leaf.left,
            height: "auto",
            opacity: leaf.opacity,
            filter: `${filter} drop-shadow(0 14px 22px rgba(0,0,0,0.4))`,
            transform: `rotate(${leaf.rotate}deg) scaleX(${leaf.flip ? -1 : 1})`,
          }}
        />
      ))}
    </div>
  );
}

export function LeafParallaxHero() {
  const heroRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const hero = heroRef.current;
      if (!hero) return;

      // Scroll: cada camada se move numa velocidade diferente (scrub = preso na posição real do scroll).
      gsap.to(backRef.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(midRef.current, {
        yPercent: 26,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(frontRef.current, {
        yPercent: 42,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      // Mouse parado: a camada da frente reage mais, dá vida mesmo sem rolar.
      const setBackX = gsap.quickTo(backRef.current, "x", { duration: 1.1, ease: "power3" });
      const setMidX = gsap.quickTo(midRef.current, "x", { duration: 0.9, ease: "power3" });
      const setFrontX = gsap.quickTo(frontRef.current, "x", { duration: 0.7, ease: "power3" });
      const setFrontY = gsap.quickTo(frontRef.current, "rotation", { duration: 0.9, ease: "power3" });

      function onMouseMove(e: MouseEvent) {
        const rect = hero!.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        setBackX(relX * 10);
        setMidX(relX * 22);
        setFrontX(relX * 38);
        setFrontY(relX * 1.5);
      }

      hero.addEventListener("mousemove", onMouseMove);
      return () => hero.removeEventListener("mousemove", onMouseMove);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex h-[92vh] min-h-[640px] items-center justify-center overflow-hidden bg-hero-bg"
    >
      <Image
        src="/images/hero/grama.png"
        alt=""
        fill
        priority
        className="object-cover opacity-70"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-hero-bg/80 via-hero-bg/55 to-hero-bg" />

      <div ref={backRef} className="pointer-events-none absolute inset-[-8%] will-change-transform">
        <LeafLayer leaves={BACK_LEAVES} filter="brightness(0.55) saturate(0.8)" className="relative h-full w-full" />
      </div>
      <div ref={midRef} className="pointer-events-none absolute inset-[-8%] will-change-transform">
        <LeafLayer leaves={MID_LEAVES} filter="brightness(0.8)" className="relative h-full w-full" />
      </div>

      <div className="relative z-10 px-6 text-center">
        <p className="mb-4 text-[11px] tracking-[0.32em] text-hero-ink-soft uppercase">
          Hortifruti &middot; do pé à sua casa
        </p>
        <h1 className="font-display text-[clamp(3.2rem,10vw,6.6rem)] font-light leading-none tracking-wide text-hero-ink">
          Horti<em className="font-medium text-leaf-bright italic">Fácil</em>
        </h1>
        <div className="mx-auto my-7 h-px w-18 bg-hero-ink-soft/40" />
        <div className="flex justify-center gap-3.5">
          <Link
            href="/login"
            className="rounded-full border border-hero-ink-soft/30 bg-hero-ink/5 px-7 py-3 text-sm font-medium text-hero-ink backdrop-blur-sm transition hover:bg-hero-ink/10"
          >
            Login
          </Link>
          <Link
            href="#catalogo"
            className="rounded-full bg-leaf-bright px-7 py-3 text-sm font-semibold text-hero-bg transition hover:brightness-110"
          >
            Ver catálogo
          </Link>
        </div>
      </div>

      <div ref={frontRef} className="pointer-events-none absolute inset-[-8%] z-[6] will-change-transform">
        <LeafLayer leaves={FRONT_LEAVES} filter="" className="relative h-full w-full" />
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[11px] tracking-[0.18em] text-hero-ink-soft uppercase">
        <div className="flex flex-col items-center gap-2">
          role
          <span className="h-6 w-px animate-pulse bg-gradient-to-b from-hero-ink-soft to-transparent" />
        </div>
      </div>
    </section>
  );
}
