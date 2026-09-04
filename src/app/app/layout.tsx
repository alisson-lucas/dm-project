import type { Metadata } from "next";
import type { ReactNode } from "react";

// Área do aluno: conteúdo pago e privado, nunca deve ser indexado.
// Vale pra /app e tudo que for criado abaixo dela.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
