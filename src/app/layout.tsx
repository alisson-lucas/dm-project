import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_URL, TEACHER } from "../lib/site";

export const metadata: Metadata = {
  // metadataBase resolve as URLs relativas de OpenGraph/canonical.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — aulas de guitarra com ${TEACHER.name}`,
    // as páginas internas viram "Entrar | DM PROJECT", etc.
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Plataforma de aulas de guitarra: trilha em vídeo sobre improvisação, modos gregos e pentatônica.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Sem JavaScript o GSAP nunca revela os blocos de entrada da landing
            (ver globals.css) — este reset devolve todos eles à vista. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: "[data-reveal],[data-hero]{opacity:1 !important}",
            }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
