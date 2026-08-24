import { notFound } from "next/navigation";
import { getStatusPedido } from "@/app/actions/orders";
import { AguardandoPagamento } from "@/components/checkout/AguardandoPagamento";

// Next.js 16: params chega como Promise (ver node_modules/next/dist/docs — Async Request APIs).
export default async function PedidoStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pedido = await getStatusPedido(id);

  if (!pedido) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6">
      <AguardandoPagamento orderId={id} numeroInicial={pedido.numero} totalInicial={pedido.total} />
    </main>
  );
}
