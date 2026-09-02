import { NextResponse } from "next/server";
import { assertCronRequest } from "../../../../lib/cron";
import { reconcileStuckWebhookEvents } from "../../../../services/hotmartProcessor";

export const dynamic = "force-dynamic";
// Cron da Vercel chama via GET (ver vercel.json). Rode a cada poucos minutos.
export async function GET(req: Request) {
  const denied = assertCronRequest(req);
  if (denied) return denied;

  await reconcileStuckWebhookEvents();
  return NextResponse.json({ ok: true });
}
