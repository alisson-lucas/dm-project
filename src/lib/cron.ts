import { NextResponse } from "next/server";

// Protege as rotas /api/cron/*. Na Vercel, defina a env var CRON_SECRET e a
// plataforma manda "Authorization: Bearer <CRON_SECRET>" nos cron jobs
// (vercel.json). Self-hosted (crontab / scheduler externo): chame a rota com
// esse mesmo header, ou com ?secret=<valor>.
export function assertCronRequest(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET não configurado (veja .env.example)" },
      { status: 500 }
    );
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const fromQuery = new URL(req.url).searchParams.get("secret");
  const provided = bearer ?? fromQuery;

  if (provided !== secret) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  return null;
}
