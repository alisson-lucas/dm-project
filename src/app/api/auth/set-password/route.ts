import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { setSessionCookie } from "../../../../lib/session";
import { AccessTokenPurpose, consumirToken } from "../../../../services/accessToken";

export const dynamic = "force-dynamic";

// Define a senha a partir de um LINK DE USO ÚNICO.
//
// A versão anterior aceitava e-mail + senha e só conferia se `passwordHash`
// ainda era null. Isso significava que qualquer um que soubesse o e-mail de um
// comprador recém-criado podia reivindicar a conta antes dele — bastava
// chegar primeiro. O token resolve: só entra quem recebeu o e-mail.
//
// O token é queimado por `consumirToken` ANTES da senha ser gravada. Se algo
// falhar depois disso, o aluno pede outro link; o caro é o contrário, deixar
// um link valendo duas vezes.

const MENSAGEM: Record<string, string> = {
  invalido: "Este link não é válido. Peça um novo na tela de entrada.",
  expirado: "Este link expirou. Peça um novo na tela de entrada.",
  usado: "Este link já foi usado. Peça um novo na tela de entrada.",
};

export async function POST(req: Request) {
  const { token, password } = (await req.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "a senha precisa ter pelo menos 8 caracteres" },
      { status: 400 }
    );
  }

  // Os dois tipos de link levam à mesma tela e à mesma ação: criar senha.
  const resultado = await consumirToken(token ?? "", [
    AccessTokenPurpose.FIRST_ACCESS,
    AccessTokenPurpose.PASSWORD_RESET,
  ]);

  if (!resultado.ok) {
    return NextResponse.json(
      { error: MENSAGEM[resultado.motivo] },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: resultado.userId },
    data: { passwordHash },
  });

  await setSessionCookie(resultado.userId);
  return NextResponse.json({ ok: true });
}
