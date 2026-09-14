import Link from "next/link";
import { formatDuration } from "@/lib/format";
import type { LessonModule } from "@/services/lessonAccess";

// A trilha inteira na lateral, e não só as aulas irmãs do módulo atual.
//
// Antes a lateral listava três aulas e morria, deixando meia tela vazia. Com o
// curso todo o aluno enxerga o caminho inteiro e pula pra onde quiser sem
// voltar pra ficha do curso.
//
// Os marcadores de estado são os mesmos pontos da régua acima (LessonRail):
// cheio = já passou, carmim = está aqui, vazio = ainda vem. Um vocabulário só
// pra tela inteira.

export function LessonPlaylist({
  modules,
  currentId,
}: {
  modules: LessonModule[];
  currentId: string;
}) {
  // posição da aula atual na lista achatada — é o que decide quem já passou
  const ordem = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const atual = ordem.indexOf(currentId);

  let posicao = 0;

  return (
    <nav
      aria-label="Conteúdo do curso"
      className="overflow-hidden rounded-xl border border-white/8 bg-bg-2/60"
    >
      {modules.map((m) => (
        <section key={m.id}>
          <h2 className="flex items-baseline gap-2.5 border-b border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="text-[0.68rem] font-bold tabular-nums tracking-[0.12em] text-accent-2">
              {m.number}
            </span>
            <span className="text-[0.86rem] font-bold leading-tight">
              {m.title}
            </span>
          </h2>

          <ol>
            {m.lessons.map((l) => {
              const pos = posicao++;
              const vista = pos < atual;
              const aqui = l.id === currentId;
              const dur = formatDuration(l.durationSeconds);

              return (
                <li key={l.id}>
                  <Link
                    href={`/app/lessons/${l.id}`}
                    aria-current={aqui ? "true" : undefined}
                    className={
                      "group flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-[0.86rem] transition-colors " +
                      (aqui
                        ? "border-l-[3px] border-l-accent-2 bg-accent/[0.16] pl-[13px] text-text"
                        : "text-text-dim hover:bg-white/[0.04] hover:text-text")
                    }
                  >
                    <span
                      aria-hidden
                      className={
                        "block flex-none rounded-full transition-all duration-200 " +
                        (aqui
                          ? "h-[11px] w-[11px] bg-accent-2 shadow-[0_0_0_3px_rgba(158,34,76,0.35)]"
                          : vista
                            ? "h-2 w-2 bg-white/40 group-hover:bg-white/70"
                            : "h-2 w-2 border border-white/25 group-hover:border-white/60")
                      }
                    />

                    <span className="min-w-0 flex-1 leading-[1.35]">
                      {l.title}
                    </span>

                    {dur ? (
                      <span className="flex-none tabular-nums text-[0.76rem] text-text-faint">
                        {dur}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </nav>
  );
}
