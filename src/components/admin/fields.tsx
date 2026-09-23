import type { ReactNode } from "react";

// Peças de formulário do painel. Ficam separadas porque o formulário de curso,
// o de produto e o de aula precisam parecer o mesmo formulário.

export const campo =
  "w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3.5 py-2.5 " +
  "text-[0.92rem] text-text placeholder:text-text-faint/70 " +
  "focus:border-accent-2 focus:outline-none";

export const SERVICOS_VIDEO = [
  { valor: "YOUTUBE", rotulo: "YouTube" },
  { valor: "VIMEO", rotulo: "Vimeo" },
  { valor: "PANDA", rotulo: "Panda Video" },
];

export function Campo({
  label,
  ajuda,
  erro,
  children,
}: {
  label: string;
  ajuda?: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-semibold">{label}</span>
      {children}
      {erro ? (
        <span className="mt-1.5 block text-[0.78rem] text-[#ff8a6b]">{erro}</span>
      ) : ajuda ? (
        <span className="mt-1.5 block text-[0.76rem] text-text-faint">
          {ajuda}
        </span>
      ) : null}
    </label>
  );
}

/** botãozinho de ação nas linhas de módulo/aula */
export const acaoSutil =
  "rounded-md border border-white/10 px-2 py-1 text-[0.72rem] text-text-dim " +
  "transition-colors hover:border-white/25 hover:text-text " +
  "disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:text-text-dim";

export const acaoPerigo =
  "rounded-md border border-[#5c2230] px-2 py-1 text-[0.72rem] text-[#ff8a6b] " +
  "transition-colors hover:border-[#8a3247] hover:text-[#ffb09a]";

/** aviso âmbar — mesma linguagem das "pendências" da lista de cursos */
export function Pendencia({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-[#5c3a1a] bg-[#2a1a0d] px-4 py-3 text-[0.85rem] text-[#ffab7d]">
      {children}
    </p>
  );
}
