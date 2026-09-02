import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { setSessionCookie } from "../../../../lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Mesma resposta pra "não existe" e "senha errada" — não vaza quais e-mails
  // têm conta. `passwordHash` null = conta criada via webhook que ainda não
  // definiu senha (use /api/auth/set-password).
  const valid =
    user?.passwordHash != null &&
    (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    return NextResponse.json({ error: "credenciais inválidas" }, { status: 401 });
  }

  await setSessionCookie(user!.id);
  return NextResponse.json({ id: user!.id, email: user!.email, name: user!.name });
}
