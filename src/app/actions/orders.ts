"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/dal";
import { getProducts } from "@/lib/data/products";
import type { MetodoPagamento, StatusPedido } from "@/types/database";

export type CheckoutItem = { productId: string; quantidade: number };

export async function criarPedido(items: CheckoutItem[], metodoPagamento: MetodoPagamento) {
  if (items.length === 0) return { ok: false as const, error: "Carrinho vazio." };

  const produtos = await getProducts();
  const linhas = items
    .map((item) => {
      const produto = produtos.find((p) => p.id === item.productId);
      if (!produto) return null;
      return { produto, quantidade: item.quantidade };
    })
    .filter((l): l is { produto: (typeof produtos)[number]; quantidade: number } => l !== null);

  const total = linhas.reduce((sum, l) => sum + l.produto.preco * l.quantidade, 0);

  if (!isSupabaseConfigured) {
    // Sem Supabase plugado ainda: confirma visualmente sem persistir de verdade.
    return { ok: true as const, demo: true as const, total };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user?.id ?? null, status: "aberto", metodo_pagamento: metodoPagamento, total })
    .select("id, numero")
    .single();

  if (orderError || !order) {
    console.error("criarPedido: falha ao inserir em orders", orderError);
    return { ok: false as const, error: "Não deu pra registrar o pedido. Tenta de novo." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    linhas.map((l) => ({
      order_id: order.id,
      product_id: l.produto.id,
      produto_nome: l.produto.nome,
      quantidade: l.quantidade,
      preco_unitario: l.produto.preco,
    })),
  );

  if (itemsError) {
    console.error("criarPedido: falha ao inserir em order_items", itemsError);
    return { ok: false as const, error: "Pedido criado, mas faltou salvar os itens." };
  }

  revalidatePath("/admin");
  return { ok: true as const, demo: false as const, numero: order.numero, total };
}

export async function atualizarStatusPedido(orderId: string, status: StatusPedido) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    return { ok: false as const, error: "Não deu pra atualizar o status do pedido." };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}
