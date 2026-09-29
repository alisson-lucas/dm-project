import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { AccessTokenPurpose } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Links de uso único para definir senha.
//
// COMO FUNCIONA: geramos um token aleatório, mandamos o valor em claro no
// e-mail e guardamos apenas o SHA-256 dele. Quem tiver o banco não consegue
// montar o link; quem tiver o link não tem nada além daquela conta, por
// algumas horas, uma vez só.
//
// SHA-256 e não bcrypt de propósito: bcrypt existe pra resistir a força bruta
// contra segredos de baixa entropia (senha de gente). Este token tem 256 bits
// aleatórios — não há o que adivinhar, e o hash rápido é o que permite buscar
// por índice em vez de varrer a tabela comparando um a um.

const VALIDADE_HORAS = {
  FIRST_ACCESS: 72, // quem comprou pode demorar pra ver o e-mail
  PASSWORD_RESET: 2,
} as const;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface TokenCriado {
  /** valor em claro — existe só aqui e no e-mail, nunca é gravado */
  token: string;
  expiraEm: Date;
}

export async function criarToken(
  userId: string,
  purpose: AccessTokenPurpose
): Promise<TokenCriado> {
  // Um pedido novo invalida os anteriores do mesmo tipo: senão o link antigo,
  // que pode estar num e-mail encaminhado, continua valendo.
  await prisma.accessToken.deleteMany({
    where: { userId, purpose, usedAt: null },
  });

  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(
    Date.now() + VALIDADE_HORAS[purpose] * 60 * 60 * 1000
  );

  await prisma.accessToken.create({
    data: { userId, purpose, tokenHash: hash(token), expiresAt: expiraEm },
  });

  return { token, expiraEm };
}

export type ResultadoToken =
  | { ok: true; userId: string }
  | { ok: false; motivo: "invalido" | "expirado" | "usado" };

/**
 * Valida e QUEIMA o token: depois desta chamada ele não vale mais, mesmo que a
 * troca de senha falhe adiante. Preferimos obrigar a pedir outro link a deixar
 * uma janela em que o mesmo link serve duas vezes.
 */
export async function consumirToken(
  token: string,
  purposes: AccessTokenPurpose[]
): Promise<ResultadoToken> {
  if (!token) return { ok: false, motivo: "invalido" };

  const registro = await prisma.accessToken.findUnique({
    where: { tokenHash: hash(token) },
  });

  // Recebe a LISTA de propósitos aceitos em vez de um só. Encadear duas
  // chamadas (tenta primeiro acesso, senão tenta recuperação) parecia
  // equivalente, mas perdia a mensagem: um link já usado casava no primeiro
  // tipo como "usado" e no segundo como "inválido", e o aluno lia a pior das
  // duas — "link inválido" quando na verdade ele só tinha clicado duas vezes.
  if (!registro || !purposes.includes(registro.purpose)) {
    return { ok: false, motivo: "invalido" };
  }
  if (registro.usedAt) return { ok: false, motivo: "usado" };
  if (registro.expiresAt.getTime() < Date.now()) {
    return { ok: false, motivo: "expirado" };
  }

  // `updateMany` com usedAt null é a trava contra dois cliques simultâneos:
  // o segundo não encontra linha pra atualizar e sai como já usado.
  const queimado = await prisma.accessToken.updateMany({
    where: { id: registro.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (queimado.count === 0) return { ok: false, motivo: "usado" };

  return { ok: true, userId: registro.userId };
}

/** comparação de segredos sem vazar tempo — usada pelas rotas de webhook/cron */
export function comparaSegredo(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export { AccessTokenPurpose };
