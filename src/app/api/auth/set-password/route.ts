import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { setSessionCookie } from "../../../../lib/session";

export const dynamic = "force-dynamic";

// PLACEHOLDER de primeiro acesso. O aluno é criado sem senha pelo webhook da
// Hotmart (services/enrollment.ts#grantAccess). Aqui ele define a senha —
// permitido SÓ enquanto `passwordHash` ainda é null.
//
// PRODUÇÃO: isso precisa de um token único enviado por e-mail (o TODO de
// "e-mail de boas-vindas / definição de senha" em enrollment.ts). Do jeito que
// está, qualquer um que saiba o e-mail de um aluno recém-criado pode reivindicar
// a conta antes dele. Não vá a público assim.
export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "email e senha (mínimo 8 caracteres) são obrigatórios" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return NextResponse.json({ error: "usuário não encontrado" }, { status: 404 });
  }
  if (user.passwordHash != null) {
    return NextResponse.json(
      { error: "senha já definida — use /api/auth/login" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
