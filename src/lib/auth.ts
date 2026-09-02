import type { User } from "@prisma/client";
import { prisma } from "./prisma";
import { readSession } from "./session";

// Substitui o antigo middleware Express `requireAuth`. O contrato que o resto
// do código espera continua o mesmo: um usuário com pelo menos { id }.

export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export class UnauthorizedError extends Error {
  constructor(message = "não autenticado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
