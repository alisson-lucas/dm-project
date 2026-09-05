import { PLACEHOLDERS } from "../../lib/landing";

// Lembrete do que ainda é dado provisório na landing.
//
// Só renderiza em desenvolvimento: `process.env.NODE_ENV` é substituído em
// tempo de build, então em produção este componente vira nada e o texto abaixo
// nem entra no bundle. O visitante nunca vê.
//
// Existe porque "+30 anos" e "+1000 alunos" são afirmações públicas numa
// página de vendas — o tipo de placeholder que não pode ir ao ar por esquecimento.
export function DevNotice() {
  if (process.env.NODE_ENV === "production" || PLACEHOLDERS.length === 0) {
    return null;
  }

  return (
    <aside
      aria-hidden
      className="fixed bottom-3 left-3 z-[9999] max-w-[330px] rounded-lg border border-amber-400/40 bg-[#1a1408]/95 p-3 text-[0.7rem] leading-[1.5] text-amber-200/90 shadow-lg backdrop-blur-sm"
    >
      <p className="font-bold uppercase tracking-[0.1em] text-amber-300">
        ⚠ {PLACEHOLDERS.length} dados provisórios
      </p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {PLACEHOLDERS.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
      <p className="mt-2 text-amber-200/50">
        Só aparece em dev — edite PLACEHOLDERS em src/lib/landing.ts
      </p>
    </aside>
  );
}
