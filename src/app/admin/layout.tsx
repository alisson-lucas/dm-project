import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

// Casca do painel. O `requireAdmin` aqui cobre TODAS as páginas de /admin —
// página nova criada nesta pasta já nasce protegida, sem ninguém precisar
// lembrar de checar.
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-5 px-[clamp(16px,4vw,32px)]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo className="text-accent-2" markClassName="h-8 w-8" />
          </Link>
          <span className="rounded bg-accent/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.13em] text-accent-2">
            Painel
          </span>

          <nav className="ml-auto flex items-center gap-4 text-[0.85rem]">
            <Link href="/app" className="text-text-dim transition-colors hover:text-text">
              Ver como aluno
            </Link>
            <span className="hidden text-[0.8rem] text-text-faint sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-[clamp(16px,4vw,32px)] pb-24 pt-9">
        {children}
      </main>
    </div>
  );
}
