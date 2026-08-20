"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function ProductGallery({ imagens, nome }: { imagens: string[]; nome: string }) {
  const [ativa, setAtiva] = useState(0);
  const fotos = imagens.filter(Boolean);

  if (fotos.length === 0) {
    return (
      <div className="flex h-72 w-72 shrink-0 items-center justify-center rounded-3xl bg-surface-2">
        <ImageOff className="h-16 w-16 text-ink-soft/40" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col-reverse items-center gap-4 sm:flex-row">
      {fotos.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              onClick={() => setAtiva(i)}
              aria-label={`Ver foto ${i + 1} de ${nome}`}
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                ativa === i ? "border-leaf-deep" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" width={64} height={64} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <div className="flex h-72 w-72 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotos[ativa]}
          alt={nome}
          width={320}
          height={320}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
