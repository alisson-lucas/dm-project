import { prisma } from "../lib/prisma";
import { WebhookEventStatus } from "@prisma/client";
import { normalizeHotmartPayload, type NormalizedHotmartEvent } from "../lib/hotmartPayload";
import { grantAccess, revokeAccess, markPending, scheduleAccessRevocation } from "./enrollment";

const RECONCILE_AFTER_MS = 5 * 60 * 1000;

interface ReceiveResult {
  alreadyReceived: boolean;
  record?: { id: string };
  normalized?: NormalizedHotmartEvent;
}

// Passo 1, síncrono e rápido: valida o payload e GRAVA o evento (status
// RECEIVED) antes de responder 200 pra Hotmart. Isso garante que, mesmo se o
// processo cair logo depois de responder, o evento não se perde — o job de
// reconciliação (reconcileStuckWebhookEvents) pega ele mais tarde.
export async function receiveHotmartEvent(rawPayload: unknown): Promise<ReceiveResult> {
  let normalized: NormalizedHotmartEvent;
  try {
    normalized = normalizeHotmartPayload(rawPayload);
  } catch (err) {
    // payload que não reconhecemos (ex.: webhook de teste do painel) — loga e ignora,
    // mas ainda respondemos 200 pra Hotmart não ficar reenviando isso indefinidamente
    await prisma.webhookEvent.create({
      data: {
        eventId: `unparsed-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        eventType: (rawPayload as any)?.event ?? "unknown",
        payload: rawPayload as any,
        status: WebhookEventStatus.IGNORED,
        error: (err as Error).message,
      },
    });
    return { alreadyReceived: false };
  }

  const existing = await prisma.webhookEvent.findUnique({ where: { eventId: normalized.transactionId } });
  if (existing) {
    return { alreadyReceived: true }; // idempotência: já vimos essa transação
  }

  const record = await prisma.webhookEvent.create({
    data: {
      eventId: normalized.transactionId,
      eventType: normalized.eventType,
      payload: rawPayload as any,
      status: WebhookEventStatus.RECEIVED,
    },
  });

  return { alreadyReceived: false, record, normalized };
}

// Passo 2, assíncrono (roda depois da resposta HTTP já ter saído): aplica de
// fato o efeito do evento — liberar/revogar acesso etc.
export async function processHotmartEvent(normalized: NormalizedHotmartEvent, webhookEventId: string) {
  try {
    switch (normalized.eventType) {
      case "PURCHASE_APPROVED":
      case "PURCHASE_COMPLETE":
        await grantAccess(normalized);
        break;

      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK":
      case "PURCHASE_CANCELED":
        await revokeAccess(normalized);
        break;

      case "PURCHASE_EXPIRED":
      case "PURCHASE_DELAYED":
        await markPending(normalized);
        break;

      case "SUBSCRIPTION_CANCELLATION": {
        // TODO: usar a data real da próxima cobrança quando confirmarmos o
        // campo no payload (varia entre "date_next_charge" e formatos
        // parecidos conforme a versão da API). Fallback conservador: 30 dias.
        const revokeAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await scheduleAccessRevocation(normalized, revokeAt);
        break;
      }

      default:
        // evento reconhecido mas sem ação definida ainda — fica só o log em
        // webhook_events pra revisão manual, não é um erro
        break;
    }

    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { status: WebhookEventStatus.PROCESSED, processedAt: new Date() },
    });
  } catch (err) {
    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { status: WebhookEventStatus.FAILED, error: (err as Error).message },
    });
    throw err;
  }
}

// Rode isso periodicamente (cron a cada poucos minutos). Pega eventos que
// ficaram travados em RECEIVED — sinal de que o processo caiu entre responder
// 200 pra Hotmart e terminar o processamento assíncrono — e reprocessa.
export async function reconcileStuckWebhookEvents() {
  const stuck = await prisma.webhookEvent.findMany({
    where: {
      status: WebhookEventStatus.RECEIVED,
      receivedAt: { lt: new Date(Date.now() - RECONCILE_AFTER_MS) },
    },
  });

  for (const event of stuck) {
    const normalized = normalizeHotmartPayload(event.payload);
    await processHotmartEvent(normalized, event.id);
  }
}
