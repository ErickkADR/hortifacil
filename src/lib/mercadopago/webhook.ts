import "server-only";
import crypto from "node:crypto";

/**
 * Valida o header `x-signature` que o Mercado Pago manda em toda notificação de webhook.
 *
 * Formato do header: `ts=<timestamp>,v1=<hmac-sha256 hex>`.
 * Manifest usado no HMAC (confirmado na doc oficial de Webhooks/Notifications + no exemplo
 * dos SDKs oficiais em 24/08/2026): `id:<data.id em minúsculo>;request-id:<x-request-id>;ts:<ts>;`
 *
 * Reconferir contra a doc oficial se algo mudar — esse formato não é versionado no path da
 * URL, então uma mudança futura do Mercado Pago quebraria isso silenciosamente (a assinatura
 * simplesmente nunca bateria, e o webhook passaria a rejeitar 100% das notificações).
 */
export function validarAssinaturaWebhook(params: {
  xSignature: string;
  xRequestId: string;
  dataId: string;
  secret: string;
}): boolean {
  const partes: Record<string, string> = {};
  for (const par of params.xSignature.split(",")) {
    const [chave, ...resto] = par.split("=");
    if (!chave) continue;
    partes[chave.trim()] = resto.join("=").trim();
  }

  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${params.dataId.toLowerCase()};request-id:${params.xRequestId};ts:${ts};`;
  const hashCalculado = crypto.createHmac("sha256", params.secret).update(manifest).digest("hex");

  let bufferCalculado: Buffer;
  let bufferRecebido: Buffer;
  try {
    bufferCalculado = Buffer.from(hashCalculado, "hex");
    bufferRecebido = Buffer.from(v1, "hex");
  } catch {
    return false;
  }

  if (bufferCalculado.length !== bufferRecebido.length) return false;
  return crypto.timingSafeEqual(bufferCalculado, bufferRecebido);
}
