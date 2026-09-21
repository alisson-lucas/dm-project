import Link from "next/link";
import { after } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLessonPlayerForUser } from "@/services/lessonAccess";
import { markLessonWatched } from "@/services/progress";
import { formatDuration } from "@/lib/format";
import { LessonRail } from "@/components/LessonRail";
import { LessonPlaylist } from "@/components/LessonPlaylist";
import { btnGhost, deniedWrap } from "@/lib/ui";

export const dynamic = "force-dynamic";

// A tela onde o aluno passa o tempo todo depois de comprar.
//
// A ideia é sala de ensaio: a luz toda no player e o resto do ambiente
// recolhido. O que era uma página de vídeo genérica ganhou três coisas que
// faltavam:
//
// - PARA ONDE IR quando o vídeo acaba. Antes a aula terminava e não havia nada
//   pra clicar; agora a próxima aula é o elemento mais forte abaixo do player,
//   e ela atravessa a fronteira do módulo.
// - ONDE VOCÊ ESTÁ. A régua de casas no topo é o braço da guitarra com uma
//   casa por aula do curso — e cada casa é um link.
// - O CURSO INTEIRO na lateral, não só as aulas irmãs. Era isso que deixava
//   metade da tela vazia.
//
// Saiu daqui um "provedor: YOUTUBE" que estava impresso na tela pro aluno.

function Seta({ para = "frente" }: { para?: "frente" | "tras" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 flex-none ${para === "tras" ? "rotate-180" : ""}`}
    >
      <path d="M2.5 8h11" />
      <path d="M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // O middleware já barra quem não tem sessão; aqui é a checagem de verdade
  // (usuário existe + matrícula ativa no curso da aula).
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/app/lessons/${id}`);

  const result = await getLessonPlayerForUser(id, user.id);

  if (!result.ok && result.status === 404) notFound();

  if (!result.ok) {
    return (
      <>
        <main className={deniedWrap}>
          <h1 className="mb-2.5 text-[1.6rem] font-bold">Acesso não liberado</h1>
          <p className="text-text-dim">{result.message}</p>
          <p className="mt-6">
            <Link href="/app" className={btnGhost}>
              Voltar ao início
            </Link>
          </p>
        </main>
      </>
    );
  }

  const { embed, lesson, modules, lessonTotal, previous, next } = result;
  const duracao = formatDuration(lesson.durationSeconds);

  // Alimenta o "Continue de onde parou" da home. Roda depois da resposta, então
  // não atrasa o player.
  after(() => markLessonWatched(user.id, lesson.courseId, lesson.id));

  return (
    <>

      {/* O fundo desce um tom abaixo do resto do app: é o que faz o player ser
          a única coisa acesa na tela. */}
      {/* overflow-x-hidden por causa do brilho do palco: ele é desenhado
          PARA FORA do player (-inset) e, no celular, onde a margem lateral é
          de 16px, vazava da tela e criava barra horizontal. */}
      <main className="min-h-screen overflow-x-hidden bg-[#08080b] pb-20 pt-[clamp(20px,3vw,30px)]">
        <div className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,48px)]">
          {/* ---------------------------------------------- trilha e posição */}
          <div className="mb-3.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <Link
              href={`/app/courses/${lesson.courseSlug}`}
              className="group inline-flex items-center gap-2 text-[0.85rem] text-text-dim transition-colors hover:text-text"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                <Seta para="tras" />
              </span>
              {lesson.courseTitle}
            </Link>

            <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-text-faint">
              Aula{" "}
              <span className="tabular-nums text-text">{lesson.position}</span>{" "}
              de <span className="tabular-nums">{lessonTotal}</span>
            </p>
          </div>

          <LessonRail modules={modules} currentId={lesson.id} />

          <div className="mt-7 grid grid-cols-1 gap-7 min-[1000px]:grid-cols-[1fr_352px] min-[1000px]:items-start">
            {/* ------------------------------------------------------ palco */}
            <div>
              <div className="relative">
                {/* o brilho carmim é o que dá o efeito de palco iluminado —
                    fica atrás do player e vaza pelas bordas */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-10 -inset-y-12 rounded-[56px] bg-[radial-gradient(closest-side,rgba(158,34,76,0.72),rgba(158,34,76,0.28)_55%,transparent)] blur-[46px]"
                />
                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]">
                  <iframe
                    src={embed.embedUrl}
                    title={lesson.title}
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>

              <div className="mt-6">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-accent-2">
                  <span className="tabular-nums">
                    Módulo {lesson.moduleNumber}
                  </span>
                  <span aria-hidden className="h-3 w-px bg-white/15" />
                  <span className="text-text-faint">{lesson.moduleTitle}</span>
                  {duracao ? (
                    <>
                      <span aria-hidden className="h-3 w-px bg-white/15" />
                      <span className="tabular-nums text-text-faint">
                        {duracao}
                      </span>
                    </>
                  ) : null}
                </p>

                <h1 className="mt-2.5 text-[clamp(1.4rem,3vw,2.05rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">
                  {lesson.title}
                </h1>
              </div>

              {/* --------------------------------------- para onde ir agora */}
              {next ? (
                <Link
                  href={`/app/lessons/${next.id}`}
                  className="group mt-7 flex items-center gap-4 rounded-xl border border-white/10 bg-surface px-5 py-4 transition-colors duration-200 hover:border-accent-2/60 hover:bg-accent/[0.1]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.64rem] font-bold uppercase tracking-[0.16em] text-accent-2">
                      Próxima aula
                    </span>
                    <span className="mt-1 block truncate text-[1rem] font-semibold">
                      {next.title}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] text-text-faint">
                      {next.moduleTitle !== lesson.moduleTitle
                        ? `Começa o módulo “${next.moduleTitle}”`
                        : (formatDuration(next.durationSeconds) ?? "")}
                    </span>
                  </span>

                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent text-white transition-transform duration-200 group-hover:translate-x-1">
                    <Seta />
                  </span>
                </Link>
              ) : (
                <div className="mt-7 rounded-xl border border-white/10 bg-surface px-5 py-5 text-center">
                  <p className="text-[0.95rem] font-semibold">
                    Você chegou ao fim da trilha.
                  </p>
                  <p className="mt-1.5 text-[0.85rem] text-text-dim">
                    Volte em qualquer aula quantas vezes precisar — o acesso não
                    expira enquanto sua compra estiver ativa.
                  </p>
                  <Link
                    href={`/app/courses/${lesson.courseSlug}`}
                    className={`${btnGhost} mt-4`}
                  >
                    Ver o curso inteiro
                  </Link>
                </div>
              )}

              {previous ? (
                <Link
                  href={`/app/lessons/${previous.id}`}
                  className="group mt-3 inline-flex max-w-full items-center gap-2.5 text-[0.82rem] text-text-faint transition-colors hover:text-text"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                    <Seta para="tras" />
                  </span>
                  <span className="truncate">
                    Aula anterior: {previous.title}
                  </span>
                </Link>
              ) : null}
            </div>

            {/* ------------------------------------------------ a trilha toda */}
            <LessonPlaylist modules={modules} currentId={lesson.id} />
          </div>
        </div>
      </main>
    </>
  );
}
