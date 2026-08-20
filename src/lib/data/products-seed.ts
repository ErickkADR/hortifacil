import type { Product } from "@/types/database";

/**
 * Seed local — usado enquanto o Supabase não está configurado (sem
 * NEXT_PUBLIC_SUPABASE_URL) e como base pro `supabase/seed.sql`.
 * `imagem_url: null` = ainda falta escolher a foto.
 * `imagens` (galeria da página do produto) é derivada de `imagem_url` aqui —
 * pra ter várias fotos por produto, edite pelo admin ou direto no Supabase.
 */
const semGaleria: Omit<Product, "imagens">[] = [
  {
    id: "tomate", slug: "tomate", nome: "Tomate", categoria: "Legume", preco: 8.9, unidade: "kg",
    imagem_url: "/images/produtos/tomate.png", estoque: 40, ativo: true,
    descricao: "Vermelho, suculento e colhido no ponto certo de maturação. Ótimo cru em saladas ou refogado no molho do dia a dia.",
  },
  {
    id: "alface", slug: "alface", nome: "Alface", categoria: "Verdura", preco: 3.5, unidade: "unid",
    imagem_url: "/images/produtos/alface.png", estoque: 30, ativo: true,
    descricao: "Folhas crocantes e fresquinhas, direto do produtor pra sua mesa. Rica em fibras — a base de qualquer salada boa.",
  },
  {
    id: "cenoura", slug: "cenoura", nome: "Cenoura", categoria: "Legume", preco: 5.9, unidade: "kg",
    imagem_url: "/images/produtos/cenoura.png", estoque: 35, ativo: true,
    descricao: "Doce, crocante e cheia de betacaroteno. Vai bem crua, no suco, refogada ou assada.",
  },
  {
    id: "banana", slug: "banana", nome: "Banana", categoria: "Fruta", preco: 6.5, unidade: "kg",
    imagem_url: "/images/produtos/banana.png", estoque: 50, ativo: true,
    descricao: "Doce e energética, a queridinha de qualquer hora do dia. Ótima pura, na vitamina ou na fruta assada.",
  },
  {
    id: "laranja", slug: "laranja", nome: "Laranja", categoria: "Fruta", preco: 5.5, unidade: "kg",
    imagem_url: "/images/produtos/laranja.png", estoque: 45, ativo: true,
    descricao: "Suculenta e cheia de vitamina C. Perfeita pro suco da manhã ou pra comer descascada mesmo.",
  },
  {
    id: "melancia", slug: "melancia", nome: "Melancia", categoria: "Fruta", preco: 4.9, unidade: "kg",
    imagem_url: "/images/produtos/melancia.jpg", estoque: 20, ativo: true,
    descricao: "Refrescante, doce e com mais de 90% de água. A fruta certa pros dias quentes.",
  },
  {
    id: "maca", slug: "maca", nome: "Maçã", categoria: "Fruta", preco: 9.9, unidade: "kg",
    imagem_url: "/images/produtos/maca.png", estoque: 40, ativo: true,
    descricao: "Crocante e levemente adocicada. Ótima pura, em saladas ou numa torta caseira.",
  },
  {
    id: "limao", slug: "limao", nome: "Limão", categoria: "Fruta", preco: 6.9, unidade: "kg",
    imagem_url: "/images/produtos/limao.jpg", estoque: 30, ativo: true,
    descricao: "Ácido na medida certa pra temperar, suco ou aquela caipirinha de fim de semana.",
  },
  {
    id: "batata", slug: "batata", nome: "Batata", categoria: "Legume", preco: 6.9, unidade: "kg",
    imagem_url: "/images/produtos/batata.png", estoque: 50, ativo: true,
    descricao: "Versátil e presente em quase toda receita — frita, cozida, assada ou no purê.",
  },
  {
    id: "pera", slug: "pera", nome: "Pera", categoria: "Fruta", preco: 10.9, unidade: "kg",
    imagem_url: "/images/produtos/pera.png", estoque: 25, ativo: true,
    descricao: "Macia, suculenta e delicadamente doce. Ótima pura ou numa salada com queijo.",
  },
  {
    id: "uva", slug: "uva", nome: "Uva", categoria: "Fruta", preco: 14.9, unidade: "kg",
    imagem_url: "/images/produtos/uva.png", estoque: 20, ativo: true,
    descricao: "Bagos suculentos, prontos pra comer direto do cacho. Antioxidante e uma delícia gelada.",
  },
  {
    id: "brocolis", slug: "brocolis", nome: "Brócolis", categoria: "Verdura", preco: 7.9, unidade: "unid",
    imagem_url: "/images/produtos/brocolis.png", estoque: 20, ativo: true,
    descricao: "Rico em nutrientes, ótimo no vapor, salteado ou numa sopa nutritiva.",
  },
  {
    id: "pimentao", slug: "pimentao", nome: "Pimentão", categoria: "Legume", preco: 9.5, unidade: "kg",
    imagem_url: "/images/produtos/pimentao.png", estoque: 25, ativo: true,
    descricao: "Crocante e colorido, dá sabor e cor pra qualquer refogado ou salada.",
  },
  {
    id: "manga", slug: "manga", nome: "Manga", categoria: "Fruta", preco: 8.5, unidade: "kg",
    imagem_url: "/images/produtos/manga.png", estoque: 30, ativo: true,
    descricao: "Polpa doce e aromática. Ótima pura, em suco ou numa salada tropical.",
  },
  {
    id: "morango", slug: "morango", nome: "Morango", categoria: "Fruta", preco: 12.9, unidade: "cx",
    imagem_url: "/images/produtos/morango.png", estoque: 20, ativo: true,
    descricao: "Vermelho, doce e perfumado. Combina com tudo — puro, no leite condensado ou na sobremesa.",
  },
  {
    id: "abacaxi", slug: "abacaxi", nome: "Abacaxi", categoria: "Fruta", preco: 7.9, unidade: "unid",
    imagem_url: "/images/produtos/abacaxi.png", estoque: 20, ativo: true,
    descricao: "Doce, ácido na medida e super refrescante. Ótimo puro, grelhado ou no suco.",
  },
  {
    id: "kiwi", slug: "kiwi", nome: "Kiwi", categoria: "Fruta", preco: 15.9, unidade: "kg",
    imagem_url: "/images/produtos/kiwi.png", estoque: 15, ativo: true,
    descricao: "Polpa verde, ácida e cheia de vitamina C. Ótimo puro, na salada de frutas ou na vitamina.",
  },
  {
    id: "pessego", slug: "pessego", nome: "Pêssego", categoria: "Fruta", preco: 11.9, unidade: "kg",
    imagem_url: "/images/produtos/pessego.png", estoque: 15, ativo: true,
    descricao: "Macio, suculento e delicadamente doce. Ótimo puro ou numa torta de fim de semana.",
  },
];

/** Fotos extras buscadas via Magnific/Freepik (20/08) — a 1ª de cada produto continua sendo `imagem_url`. */
const galeriaExtra: Record<string, string[]> = {
  tomate: ["/images/produtos/tomate-2.jpg", "/images/produtos/tomate-3.jpg", "/images/produtos/tomate-4.jpg"],
  alface: ["/images/produtos/alface-2.jpg", "/images/produtos/alface-3.jpg", "/images/produtos/alface-4.jpg"],
  cenoura: ["/images/produtos/cenoura-2.jpg", "/images/produtos/cenoura-3.jpg", "/images/produtos/cenoura-4.jpg"],
  banana: ["/images/produtos/banana-2.jpg", "/images/produtos/banana-3.jpg", "/images/produtos/banana-4.jpg"],
  laranja: ["/images/produtos/laranja-2.jpg", "/images/produtos/laranja-3.jpg", "/images/produtos/laranja-4.jpg"],
  maca: ["/images/produtos/maca-2.jpg", "/images/produtos/maca-3.jpg", "/images/produtos/maca-4.jpg"],
  batata: ["/images/produtos/batata-2.jpg", "/images/produtos/batata-3.jpg", "/images/produtos/batata-4.jpg"],
  pera: ["/images/produtos/pera-2.jpg", "/images/produtos/pera-3.jpg", "/images/produtos/pera-4.jpg"],
  uva: ["/images/produtos/uva-2.jpg", "/images/produtos/uva-3.jpg", "/images/produtos/uva-4.jpg"],
  brocolis: ["/images/produtos/brocolis-2.jpg", "/images/produtos/brocolis-3.jpg", "/images/produtos/brocolis-4.jpg"],
  pimentao: ["/images/produtos/pimentao-2.jpg", "/images/produtos/pimentao-3.jpg", "/images/produtos/pimentao-4.jpg"],
  manga: ["/images/produtos/manga-2.jpg", "/images/produtos/manga-3.jpg", "/images/produtos/manga-4.jpg"],
  morango: ["/images/produtos/morango-2.jpg", "/images/produtos/morango-3.jpg", "/images/produtos/morango-4.jpg"],
  abacaxi: ["/images/produtos/abacaxi-2.jpg", "/images/produtos/abacaxi-3.jpg", "/images/produtos/abacaxi-4.jpg"],
  kiwi: ["/images/produtos/kiwi-2.jpg", "/images/produtos/kiwi-3.jpg", "/images/produtos/kiwi-4.jpg"],
  pessego: ["/images/produtos/pessego-2.jpg", "/images/produtos/pessego-3.jpg", "/images/produtos/pessego-4.jpg"],
};

export const productsSeed: Product[] = semGaleria.map((p) => ({
  ...p,
  imagens: [...(p.imagem_url ? [p.imagem_url] : []), ...(galeriaExtra[p.id] ?? [])],
}));
