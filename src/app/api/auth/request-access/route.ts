import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { AccessTokenPurpose, criarToken } from "../../../../services/accessToken";
import {
  emailDeBoasVindas,
  emailDeNovaSenha,
  enviarEmail,
} from "../../../../services/email";

export const dynamic = "force-dynamic";

// "Não recebi o e-mail" / "esqueci a senha": manda um link novo.
//
// SEMPRE responde ok, mesmo quando o e-mail não existe. Dizer "usuário não
// encontrado" transformaria esta rota num verificador de quem comprou o
// curso — qualquer um poderia testar endereços e descobrir a lista de alunos.

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const endereco = email?.toLowerCase().trim();

  if (!endereco) {
    return NextResponse.json({ error: "informe o e-mail" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: endereco },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: { course: { select: { title: true } } },
        take: 1,
      },
    },
  });

  if (user) {
    const primeiroAcesso = user.passwordHash === null;
    const { token } = await criarToken(
      user.id,
      primeiroAcesso
        ? AccessTokenPurpose.FIRST_ACCESS
        : AccessTokenPurpose.PASSWORD_RESET
    );

    await enviarEmail(
      primeiroAcesso
        ? emailDeBoasVindas(
            user.email,
            token,
            user.enrollments[0]?.course.title ?? "seu curso"
          )
        : emailDeNovaSenha(user.email, token)
    );
  }

  return NextResponse.json({ ok: true });
}
