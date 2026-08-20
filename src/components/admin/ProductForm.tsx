"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ImageOff } from "lucide-react";
import type { Product } from "@/types/database";
import { criarProduto, atualizarProdutoCompleto, excluirProduto, type ProductInput } from "@/app/actions/products";

const UNIDADES = ["kg", "unid", "cx"];

export function ProductForm({
  produto,
  categorias,
}: {
  produto?: Product;
  categorias: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState(produto?.nome ?? "");
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [categoria, setCategoria] = useState(produto?.categoria ?? categorias[0] ?? "");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [preco, setPreco] = useState(produto?.preco?.toString() ?? "");
  const [unidade, setUnidade] = useState(produto?.unidade ?? "kg");
  const [estoque, setEstoque] = useState(produto?.estoque?.toString() ?? "0");
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [imagens, setImagens] = useState<string[]>(() => {
    const base = produto?.imagens?.length ? produto.imagens : produto?.imagem_url ? [produto.imagem_url] : [];
    return [base[0] ?? "", base[1] ?? "", base[2] ?? "", base[3] ?? ""];
  });

  function setImagem(i: number, valor: string) {
    setImagens((prev) => prev.map((v, idx) => (idx === i ? valor : v)));
  }

  function submit() {
    const categoriaFinal = categoria === "__nova__" ? novaCategoria.trim() : categoria;

    if (!nome.trim() || !categoriaFinal || !preco) {
      setErro("Preenche nome, categoria e preço.");
      return;
    }

    const input: ProductInput = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      categoria: categoriaFinal,
      preco: Number(preco),
      unidade,
      estoque: Number(estoque),
      ativo,
      imagens,
    };

    setErro(null);
    startTransition(async () => {
      const res = produto
        ? await atualizarProdutoCompleto(produto.id, input)
        : await criarProduto(input);
      if (res && !res.ok) setErro(res.error);
    });
  }

  function excluir() {
    if (!produto) return;
    if (!confirm(`Excluir "${produto.nome}"? Não dá pra desfazer.`)) return;
    startTransition(async () => {
      const res = await excluirProduto(produto.id);
      if (!res.ok) {
        setErro(res.error);
        return;
      }
      router.push("/admin/produtos");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Tomate"
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Descrição</span>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            placeholder="Frase curta pra página do produto"
            className="resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Categoria</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__nova__">+ nova categoria</option>
            </select>
          </label>

          {categoria === "__nova__" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Nome da categoria</span>
              <input
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Ex.: Temperos"
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Unidade</span>
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-leaf"
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Preço (R$)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink tabular-nums outline-none focus:border-leaf"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Estoque</span>
            <input
              type="number"
              min="0"
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink tabular-nums outline-none focus:border-leaf"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 accent-leaf"
          />
          <span className="text-sm text-ink">
            <span className="font-medium">Ativo</span>
            <span className="ml-1 text-ink-soft">— aparece no catálogo pro cliente</span>
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <span className="mb-2 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Imagens (até 4)
          </span>
          <div className="grid grid-cols-2 gap-3">
            {imagens.map((url, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-ink-soft/40" strokeWidth={1.5} />
                  )}
                </div>
                <input
                  value={url}
                  onChange={(e) => setImagem(i, e.target.value)}
                  placeholder={`URL da imagem ${i + 1}`}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-leaf"
                />
              </div>
            ))}
          </div>
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <button
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-leaf-deep py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "Salvando..." : produto ? "Salvar mudanças" : "Criar produto"}
        </button>

        {produto && (
          <button
            onClick={excluir}
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-full border border-danger/30 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Excluir produto
          </button>
        )}
      </div>
    </div>
  );
}
