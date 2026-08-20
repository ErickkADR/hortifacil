import { ImageOff } from "lucide-react";
import type { Product } from "@/types/database";

export function ProductThumb({
  product,
  size,
  className,
  iconClassName,
}: {
  product: Pick<Product, "nome" | "imagem_url">;
  size: number;
  className?: string;
  iconClassName?: string;
}) {
  if (product.imagem_url) {
    // <img> comum de propósito: fotos de produto podem vir de qualquer URL
    // externa que o admin colar (Unsplash, Pexels, etc.), e o next/image
    // exige domínio pré-cadastrado em next.config.ts — travaria o cadastro.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imagem_url}
        alt={product.nome}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-surface-2 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <ImageOff
        className={iconClassName ?? "h-1/2 w-1/2 text-ink-soft/50"}
        strokeWidth={1.5}
      />
    </div>
  );
}
