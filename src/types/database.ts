export type UserRole = "admin" | "cliente";

export type MetodoPagamento = "debito" | "credito" | "pix";

// "aberto" fica só por compatibilidade com pedidos antigos (linhas já gravadas antes do
// pagamento real) — nenhum fluxo novo cria pedido nesse status.
// Pedido do cliente nasce "pendente_pagamento" e só vira "pago" quando o webhook do Mercado
// Pago confirmar. Pedido do POS do admin nasce direto "pago" (venda presencial).
export type StatusPedido = "pendente_pagamento" | "aberto" | "pago" | "cancelado" | "falhou";

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
  // preenchidos pelo fluxo de pagamento do Mercado Pago (nulos em pedido do POS do admin,
  // que não passa por gateway nenhum)
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  mp_status: string | null;
  mp_status_detail: string | null;
  pago_em: string | null;
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
    Functions: {
      // função SQL em supabase/pagamento-mercadopago-2026-08-24.sql — só a service role tem
      // grant execute (ver a própria função), chamada pelo webhook do Mercado Pago.
      confirmar_pagamento_pedido: {
        Args: {
          p_order_id: string;
          p_mp_payment_id: string | null;
          p_mp_status: string | null;
          p_mp_status_detail: string | null;
        };
        Returns: void;
      };
    };
  };
};
