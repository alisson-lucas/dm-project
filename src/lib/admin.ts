import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { getCurrentUser } from "./auth";

// Porta do painel administrativo.
//
// O middleware só sabe verificar a assinatura do cookie — ele roda no runtime
// edge, onde o Prisma não existe, e o token carrega apenas o userId. Quem é
// admin, portanto, só dá pra saber com uma consulta ao banco, e é aqui que ela
// acontece: TODA página do /admin passa por esta função no layout.
//
// Aluno que descobrir a URL cai no /app sem nem saber que o painel existe —
// devolver 403 seria confirmar que há algo ali.

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/app");

  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
