import Link from "next/link";
import type { LessonModule } from "@/services/lessonAccess";

// Onde o aluno está na trilha, desenhado como o braço da guitarra: uma casa
// por aula, a atual acesa em carmim, as que ficaram pra trás marcadas e as
// próximas vazias.
//
// É o mesmo vocabulário dos diagramas da landing (components/landing/
// Benefits.tsx), e aqui ele não é enfeite: cada casa é um link, então a barra
// diz onde você está E leva pra qualquer aula sem passar pela tela do curso.
//
// HTML e CSS, não SVG: a régua precisa esticar até a largura da coluna, e em
// SVG isso ou distorce os pontos ou exige recalcular o viewBox por número de
// aulas.

const DOT_BASE =
  "block rounded-full transition-all duration-200 ease-out";

export function LessonRail({
  modules,
  currentId,
}: {
  modules: LessonModule[];
  currentId: string;
}) {
  const aulas = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );
  const atual = aulas.findIndex((l) => l.id === currentId);

  if (aulas.length < 2) return null;

  // Quanto do braço já foi percorrido: vai até o MEIO da casa atual, que é
  // onde o ponto aceso está. Sem esse preenchimento a régua lia como uma
  // caixa vazia com uns pontinhos soltos dentro.
  const percorrido = ((atual + 0.5) / aulas.length) * 100;

  return (
    <nav aria-label="Aulas do curso">
      <ol
        className={
          // o corpo do braço: as duas bordas são o filete da madeira, e o
          // gradiente repetido faz as cordas
          "relative flex h-[38px] overflow-hidden rounded-[4px] border-y border-white/15 " +
          "bg-white/[0.025] bg-[repeating-linear-gradient(to_bottom,transparent_0_6px,rgba(255,255,255,0.08)_6px_7px)]"
        }
      >
        <span
          aria-hidden
          style={{ width: `${percorrido}%` }}
          className="pointer-events-none absolute inset-y-0 left-0 bg-[linear-gradient(to_right,rgba(158,34,76,0.05),rgba(158,34,76,0.42))]"
        />
        {aulas.map((l, i) => {
          const vista = i < atual;
          const aqui = i === atual;

          return (
            <li
              key={l.id}
              className="relative min-w-0 flex-1 border-r border-white/10 last:border-r-0"
            >
              <Link
                href={`/app/lessons/${l.id}`}
                aria-current={aqui ? "true" : undefined}
                aria-label={`Aula ${i + 1}: ${l.title}`}
                title={`${i + 1}. ${l.title}`}
                className="group flex h-full items-center justify-center focus-visible:bg-white/5"
              >
                <span
                  aria-hidden
                  className={
                    aqui
                      ? `${DOT_BASE} h-[13px] w-[13px] bg-accent-2 shadow-[0_0_0_4px_rgba(158,34,76,0.3),0_0_16px_3px_rgba(198,44,96,0.45)]`
                      : vista
                        ? `${DOT_BASE} h-[9px] w-[9px] bg-white/40 group-hover:h-[13px] group-hover:w-[13px] group-hover:bg-white/70`
                        : `${DOT_BASE} h-[9px] w-[9px] border border-white/30 group-hover:h-[13px] group-hover:w-[13px] group-hover:border-white/70`
                  }
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
