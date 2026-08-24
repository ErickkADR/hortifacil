/**
 * URL pública do site, usada pra montar back_urls/notification_url (o Mercado Pago exige
 * absolutos, https). Prioriza NEXT_PUBLIC_APP_URL (setado à mão — obrigatório em dev, via
 * túnel), mas cai pra VERCEL_URL se não tiver: a Vercel injeta essa variável sozinha em cada
 * deploy (produção ou preview), então os Preview deployments funcionam pro webhook sem
 * precisar atualizar env var a cada novo preview.
 */
export function getAppUrl(): string | null {
  const explicita = process.env.NEXT_PUBLIC_APP_URL;
  if (explicita) return explicita.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return null;
}

// Sem o token E sem a URL pública do site não dá pra montar nem o /v1/orders (Pix) nem a
// preferência do Checkout Pro — por isso os dois entram na mesma checagem.
export const isMercadoPagoConfigured = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN && getAppUrl());
