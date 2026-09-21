"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Busca do topo. Não filtra em tela: manda pro catálogo com ?q=, que é onde a
// lista completa já vive (ExploreBrowser). Duplicar a filtragem aqui daria
// duas implementações da mesma regra pra manter sincronizadas.
export function CourseSearch() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = termo.trim();
        router.push(q ? `/app/explorar?q=${encodeURIComponent(q)}` : "/app/explorar");
      }}
      className="relative w-full max-w-[420px]"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-text-faint"
      >
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13.5 13.5 3 3" />
      </svg>

      <input
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Pesquisar curso…"
        aria-label="Pesquisar curso"
        className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-4 text-[0.88rem] text-text placeholder:text-text-faint focus:border-accent-2 focus:bg-white/[0.07] focus:outline-none"
      />
    </form>
  );
}
