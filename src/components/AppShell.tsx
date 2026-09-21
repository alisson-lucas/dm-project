import Link from "next/link";
import type { ReactNode } from "react";
import type { User } from "@prisma/client";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { CourseSearch } from "./CourseSearch";

// Casca da área do aluno: menu lateral no desktop, barra no topo no celular.
//
// Ela mora no layout de /app, e não em cada página, por um motivo prático: um
// menu que aparece só na home e some quando o aluno abre um curso não lê como
// design, lê como bug.
//
// Por que lateral em vez da barra de antes: a plataforma tem poucos destinos
// (início, catálogo, conta) e o aluno volta a eles o tempo todo. Na lateral
// eles ficam permanentemente à vista, e a faixa do topo passa a ser só busca e
// identidade — que é o arranjo da referência que o cliente mandou.

const LINKS = [
  { href: "/app", rotulo: "Início", icone: "casa" },
  { href: "/app/explorar", rotulo: "Explorar", icone: "grade" },
] as const;

function Icone({ nome }: { nome: string }) {
  const comum = {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "h-[18px] w-[18px] flex-none",
  };

  if (nome === "casa") {
    return (
      <svg {...comum}>
        <path d="M3.5 8.5 10 3l6.5 5.5" />
        <path d="M5 8v8.5h10V8" />
      </svg>
    );
  }
  if (nome === "grade") {
    return (
      <svg {...comum}>
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg {...comum}>
      <path d="M4 16v-1.5A3.5 3.5 0 0 1 7.5 11h5a3.5 3.5 0 0 1 3.5 3.5V16" />
      <circle cx="10" cy="6.5" r="3" />
    </svg>
  );
}

function iniciais(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

function Navegacao({ admin }: { admin: boolean }) {
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.88rem] text-text-dim transition-colors hover:bg-white/[0.06] hover:text-text"
        >
          <Icone nome={l.icone} />
          {l.rotulo}
        </Link>
      ))}

      {admin ? (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.88rem] text-accent-2 transition-colors hover:bg-accent/10"
        >
          <Icone nome="pessoa" />
          Painel
        </Link>
      ) : null}
    </nav>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const admin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-bg">
      {/* ------------------------------------------- menu lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-white/8 bg-bg-2 px-4 py-5 lg:flex">
        <Link href="/app" className="mb-7 block px-2 text-accent-2">
          <Logo markClassName="h-8 w-8" textClassName="text-[0.95rem]" />
        </Link>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
          <span
            aria-hidden
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-[0.72rem] font-bold text-white"
          >
            {iniciais(user.email)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.82rem] font-semibold">
              {user.name ?? "Aluno"}
            </span>
            <span className="block truncate text-[0.7rem] text-text-faint">
              {user.email}
            </span>
          </span>
        </div>

        <Navegacao admin={admin} />

        <div className="mt-auto border-t border-white/8 pt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* ------------------------------------------------ barra (celular) */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/8 bg-bg/95 px-4 backdrop-blur-sm lg:hidden">
        <Link href="/app" className="text-accent-2">
          <Logo markClassName="h-8 w-8" textClassName="text-[0.95rem]" />
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-[0.85rem] text-text-dim">
          <Link href="/app/explorar" className="hover:text-text">
            Explorar
          </Link>
          {admin ? (
            <Link href="/admin" className="text-accent-2">
              Painel
            </Link>
          ) : null}
          <LogoutButton />
        </nav>
      </header>

      {/* ----------------------------------------------------- conteúdo */}
      <div className="lg:pl-[236px]">
        {/* faixa de busca: só no desktop, onde ela cabe sem competir com o
            conteúdo. No celular a busca vive dentro da tela Explorar. */}
        <div className="sticky top-0 z-30 hidden h-16 items-center gap-5 border-b border-white/8 bg-bg/90 px-[clamp(16px,3vw,32px)] backdrop-blur-sm lg:flex">
          <CourseSearch />
          <span className="ml-auto text-[0.78rem] text-text-faint">
            {user.email}
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
