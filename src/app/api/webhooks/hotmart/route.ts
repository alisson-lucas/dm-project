import { after, NextResponse } from "next/server";
import {
  receiveHotmartEvent,
  processHotmartEvent,
} from "../../../../services/hotmartProcessor";

// Route Handler = equivalente ao antigo `POST /webhooks/hotmart` do Express.
// Roda no runtime Node (default), que é o que o Prisma precisa.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);

  // Confirme no painel (aba Autenticação do Webhook) se a sua conta manda o
  // Hottok num header ou dentro do corpo — ajuste aqui conforme o real.
  const hottok =
    req.headers.get("x-hotmart-hottok") ?? (raw as { hottok?: string } | null)?.hottok;
  if (hottok !== process.env.HOTMART_HOTTOK) {
    return new NextResponse("invalid token", { status: 401 });
  }

  const result = await receiveHotmartEvent(raw);

  // O evento já foi gravado no banco (durabilidade) antes desta linha. O
  // processamento pesado roda em `after()` — depois da resposta HTTP já ter
  // saído — então a Hotmart não precisa esperar. Se o processo morrer antes de
  // terminar, o cron `reconcileStuckWebhookEvents` pega o evento travado.
  if (!result.alreadyReceived && result.record && result.normalized) {
    const { record, normalized } = result;
    after(async () => {
      try {
        await processHotmartEvent(normalized, record.id);
      } catch (err) {
        console.error("Falha ao processar evento Hotmart", record.id, err);
      }
    });
  }

  return new NextResponse("ok", { status: 200 });
}
