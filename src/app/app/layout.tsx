import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

// Área do aluno: conteúdo pago e privado, nunca deve ser indexado.
// Vale pra /app e tudo que for criado abaixo dela.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  // O middleware já barrou quem não tem sessão; aqui é pra ter o usuário em
  // mãos e montar a casca (nome, e-mail, se é admin). As páginas continuam
  // buscando o usuário por conta própria — elas precisam do id pra consultar
  // matrícula, e cada uma é responsável pela própria checagem.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");

  return <AppShell user={user}>{children}</AppShell>;
}
