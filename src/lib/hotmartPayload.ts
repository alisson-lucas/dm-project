// Normaliza o payload cru do webhook da Hotmart pra um formato interno estável.
//
// IMPORTANTE: os nomes de campo abaixo (data.buyer.email, data.purchase.transaction
// etc.) são baseados na documentação pública e em integrações de terceiros, mas
// os sites oficiais da Hotmart bloquearam a extração automática do schema completo
// durante a pesquisa que embasou este scaffold. Antes de ir pra produção, confirme
// o payload real no painel do professor (Ferramentas → Webhook → Testar webhook)
// e ajuste este arquivo — é o ÚNICO lugar que precisa mudar se algum nome de
// campo estiver diferente.

export interface NormalizedHotmartEvent {
  eventType: string;
  transactionId: string;
  buyerEmail: string;
  buyerName?: string;
  hotmartProductId: string;
  hotmartOfferCode?: string;
}

export function normalizeHotmartPayload(raw: unknown): NormalizedHotmartEvent {
  const body = raw as Record<string, any>;

  const data = body?.data ?? {};
  const purchase = data.purchase ?? {};
  // "buyer" é o nome mais comum na doc da Hotmart; alguns exemplos de terceiros
  // usam "customer" — aceitamos os dois pra reduzir o risco de quebrar.
  const buyer = data.buyer ?? data.customer ?? {};
  const product = data.product ?? {};
  const offer = purchase.offer ?? data.offer ?? {};

  const transactionId = purchase.transaction ?? purchase.order_id ?? body?.id;
  const buyerEmail = buyer.email ?? buyer.buyer_email;
  const hotmartProductId = product.id ?? data.product_id;

  if (!transactionId || !buyerEmail || !hotmartProductId) {
    throw new Error(
      "Payload da Hotmart não reconhecido (faltando transaction id, e-mail do comprador ou id do produto) — " +
        "confira o formato real no painel antes de tratar como erro definitivo, pode ser o webhook de teste."
    );
  }

  return {
    eventType: body.event,
    transactionId: String(transactionId),
    buyerEmail: String(buyerEmail).toLowerCase().trim(),
    buyerName: buyer.name ?? undefined,
    hotmartProductId: String(hotmartProductId),
    hotmartOfferCode: offer.code ?? offer.off ?? undefined,
  };
}
