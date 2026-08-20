"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/dal";

export type ProductInput = {
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  unidade: string;
  estoque: number;
  ativo: boolean;
  imagens: string[];
};

function slugify(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function semSupabase() {
  return { ok: false as const, error: "Supabase ainda não plugado — mudança não persiste." };
}

export async function criarProduto(input: ProductInput) {
  await requireAdmin();
  if (!isSupabaseConfigured) return semSupabase();

  const slug = slugify(input.nome);
  const imagens = input.imagens.filter(Boolean).slice(0, 4);

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    id: slug,
    slug,
    nome: input.nome,
    descricao: input.descricao,
    categoria: input.categoria,
    preco: input.preco,
    unidade: input.unidade,
    estoque: input.estoque,
    ativo: input.ativo,
    imagens,
    imagem_url: imagens[0] ?? null,
  });

  if (error) {
    const msg = error.code === "23505" ? "Já existe um produto com esse nome." : "Não deu pra criar o produto.";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function atualizarProdutoCompleto(id: string, input: ProductInput) {
  await requireAdmin();
  if (!isSupabaseConfigured) return semSupabase();

  const imagens = input.imagens.filter(Boolean).slice(0, 4);

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      nome: input.nome,
      descricao: input.descricao,
      categoria: input.categoria,
      preco: input.preco,
      unidade: input.unidade,
      estoque: input.estoque,
      ativo: input.ativo,
      imagens,
      imagem_url: imagens[0] ?? null,
    })
    .eq("id", id);

  if (error) return { ok: false as const, error: "Não deu pra salvar as mudanças." };

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath(`/produto/${input.categoria}`);
  redirect("/admin/produtos");
}

export async function atualizarProduto(
  id: string,
  patch: { preco?: number; estoque?: number; ativo?: boolean },
) {
  await requireAdmin();
  if (!isSupabaseConfigured) return semSupabase();

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(patch).eq("id", id);

  if (error) return { ok: false as const, error: "Não deu pra salvar." };

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function excluirProduto(id: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return semSupabase();

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    const msg =
      error.code === "23503"
        ? "Esse produto já tem pedidos registrados — desative em vez de excluir."
        : "Não deu pra excluir.";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return { ok: true as const };
}
