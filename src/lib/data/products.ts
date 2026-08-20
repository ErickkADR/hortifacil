import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { productsSeed } from "@/lib/data/products-seed";
import type { Product } from "@/types/database";

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return productsSeed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("ativo", true)
    .order("categoria", { ascending: true })
    .order("nome", { ascending: true });

  if (error || !data || data.length === 0) return productsSeed;
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const produtos = await getProducts();
  return produtos.find((p) => p.slug === slug) ?? null;
}

/** Pra telas de admin: inclui produtos inativos (RLS libera pra quem é admin). */
export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured) return productsSeed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("categoria", { ascending: true })
    .order("nome", { ascending: true });

  if (error || !data) return productsSeed;
  return data;
}
