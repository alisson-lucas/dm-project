import { NextResponse } from "next/server";
import { assertCronRequest } from "../../../../lib/cron";
import { revokeExpiredEnrollments } from "../../../../jobs/revokeExpiredEnrollments";

export const dynamic = "force-dynamic";
// Cron da Vercel chama via GET (ver vercel.json). Rode a cada hora.
export async function GET(req: Request) {
  const denied = assertCronRequest(req);
  if (denied) return denied;

  const revoked = await revokeExpiredEnrollments();
  return NextResponse.json({ ok: true, revoked });
}
