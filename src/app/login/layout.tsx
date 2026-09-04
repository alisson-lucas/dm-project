import type { Metadata } from "next";
import type { ReactNode } from "react";

// A página de login é client component (não pode exportar metadata), então o
// noindex vem daqui.
export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
