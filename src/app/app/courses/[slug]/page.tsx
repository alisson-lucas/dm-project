import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCoursePageForUser } from "@/services/coursePage";
import { TopBar } from "@/components/TopBar";
import { CourseContents } from "@/components/CourseContents";
import { CourseIntro } from "@/components/CourseIntro";
import { btnPrimary, sectionTitle } from "@/lib/ui";
import { TEACHER, teacherInitials } from "@/lib/site";

export const dynamic = "force-dynamic";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[1.25rem] font-bold tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-[0.6rem] font-medium uppercase tracking-[0.13em] text-text-faint">
        {label}
      </div>
    </div>
  );
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/app/courses/${slug}`);

  const result = await getCoursePageForUser(user.id, slug);

  if (result.status === "not-found") notFound();

  const { access, data: c } = result;
  const preview = access === "preview";

  return (
    <>
      <TopBar email={user.email} />
      <main className="max-w-page mx-auto px-[clamp(16px,4vw,48px)] pb-20 pt-[calc(4rem+40px)]">
        <div className="grid gap-[clamp(28px,4vw,44px)] lg:grid-cols-[1fr_0.84fr] lg:items-start">
          <div>
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-accent-2">
              {[preview ? "Curso" : "Trilha", c.levelLabel]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <h1 className="mt-3.5 text-[clamp(2rem,4.5vw,2.5rem)] font-extrabold leading-[1.03] tracking-[-0.03em]">
              {c.title}
            </h1>

            {c.description ? (
              <p className="mt-3 max-w-[52ch] text-[0.95rem] leading-[1.6] text-text-dim">
                {c.description}
              </p>
            ) : null}

            <div className="my-[26px] flex flex-wrap gap-x-7 gap-y-4 border-y border-white/8 py-[18px]">
              <Stat value={String(c.stats.lessonTotal)} label="Aulas" />
              {c.stats.durationLabel ? (
                <Stat value={c.stats.durationLabel} label="Duração" />
              ) : null}
              {!preview ? (
                <Stat
                  value={String(c.stats.completedCount)}
                  label="Concluídas"
                />
              ) : null}
              <Stat value={String(c.stats.moduleCount)} label="Módulos" />
            </div>

            {preview ? (
              <div className="flex flex-wrap items-center gap-3.5">
                {c.checkoutUrl ? (
                  <a
                    href={c.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnPrimary}
                  >
                    Comprar curso
                  </a>
                ) : (
                  <span
                    className={`${btnPrimary} pointer-events-none opacity-50`}
                  >
                    Compra em breve
                  </span>
                )}
                <span className="text-[0.78rem] tracking-[0.04em] text-text-faint">
                  Acesso liberado na hora após a compra
                </span>
              </div>
            ) : c.currentLesson ? (
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href={`/app/lessons/${c.currentLesson.id}`}
                  className={btnPrimary}
                >
                  {c.fresh
                    ? "Começar a primeira aula"
                    : `Continuar na aula ${c.currentLesson.number}`}
                </Link>
                <span className="text-[0.78rem] tracking-[0.04em] text-text-faint">
                  {c.percent}% concluído
                </span>
              </div>
            ) : (
              <p className="text-[0.88rem] text-text-dim">
                As aulas deste curso ainda estão sendo publicadas.
              </p>
            )}
          </div>

          <div>
            {/* Vídeo de apresentação no lugar da capa. A capa não sumiu: ela
                virou o pôster do player. Curso sem vídeo cadastrado continua
                mostrando só a imagem, como antes — nenhuma tela quebra por
                causa de uma coluna vazia. */}
            {c.introVideo ? (
              <CourseIntro
                embedUrl={c.introVideo.embedUrl}
                poster={c.coverImageUrl}
                title={c.title}
              />
            ) : (
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(135deg,#2a1a22,#141018)]">
                {c.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.coverImageUrl}
                    alt=""
                    // absolute pelo mesmo motivo do ExploreCard: sem isso a
                    // imagem estica o container que só tem aspect-ratio
                    className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
                  />
                ) : (
                  <span className="px-4 text-center text-[0.72rem] uppercase tracking-[0.13em] text-text-faint">
                    {c.title}
                  </span>
                )}
              </div>
            )}

            {/* Professor da casa — sempre o mesmo, vem de src/lib/site.ts */}
            <div className="mt-4 flex items-center gap-3">
              {TEACHER.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={TEACHER.avatarUrl}
                  alt=""
                  className="h-[38px] w-[38px] flex-none rounded-full border border-white/8 object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-white/8 bg-surface-2 text-[0.72rem] font-semibold text-text-faint"
                >
                  {teacherInitials}
                </span>
              )}
              <div>
                <div className="text-[0.88rem] font-semibold">
                  {TEACHER.name}
                </div>
                <div className="mt-0.5 text-[0.72rem] tracking-[0.04em] text-text-faint">
                  {TEACHER.headline}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className={`${sectionTitle} mb-4 mt-[clamp(34px,5vw,54px)]`}>
          Conteúdo do curso
        </h3>
        <CourseContents modules={c.modules} locked={preview} />
      </main>
    </>
  );
}
