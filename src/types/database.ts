export type UserRole = "admin" | "cliente";

export type MetodoPagamento = "debito" | "credito" | "pix";

export type StatusPedido = "aberto" | "pago" | "cancelado";

export type Profile = {
  id: string;
  nome: string | null;
  role: UserRole;
  criado_em: string;
};

export type Product = {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  preco: number;
  unidade: string;
  imagem_url: string | null;
  imagens: string[];
  descricao: string;
  estoque: number;
  ativo: boolean;
};

export type Order = {
  id: string;
  numero: number;
  user_id: string | null;
  status: StatusPedido;
  metodo_pagamento: MetodoPagamento | null;
  total: number;
  criado_em: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order>;
        Update: Partial<Order>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem>;
        Update: Partial<OrderItem>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
