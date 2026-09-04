import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCoursePageForUser } from "@/services/coursePage";
import { TopBar } from "@/components/TopBar";
import { CourseContents } from "@/components/CourseContents";
import { btnGhost, btnPrimary, deniedWrap, sectionTitle } from "@/lib/ui";
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

  if (result.status === "forbidden") {
    return (
      <>
        <TopBar email={user.email} />
        <main className={deniedWrap}>
          <h1 className="mb-2.5 text-[1.6rem] font-bold">
            Você ainda não tem este curso
          </h1>
          <p className="text-text-dim">
            O acesso é liberado automaticamente após a compra na Hotmart. Se você
            já comprou, aguarde alguns minutos e recarregue.
          </p>
          <p className="mt-6">
            <Link href="/app" className={btnGhost}>
              Voltar ao catálogo
            </Link>
          </p>
        </main>
      </>
    );
  }

  const c = result.data;

  return (
    <>
      <TopBar email={user.email} />
      <main className="max-w-page mx-auto px-[clamp(16px,4vw,48px)] pb-20 pt-[calc(4rem+40px)]">
        <div className="grid gap-[clamp(28px,4vw,44px)] lg:grid-cols-[1fr_0.84fr] lg:items-start">
          <div>
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-accent-2">
              {["Trilha", c.levelLabel].filter(Boolean).join(" · ")}
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
              <Stat
                value={String(c.stats.completedCount)}
                label="Concluídas"
              />
              <Stat value={String(c.stats.moduleCount)} label="Módulos" />
            </div>

            {c.currentLesson ? (
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
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(135deg,#2a1a22,#141018)]">
              {c.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-4 text-center text-[0.72rem] uppercase tracking-[0.13em] text-text-faint">
                  {c.title}
                </span>
              )}
            </div>

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
        <CourseContents modules={c.modules} />
      </main>
    </>
  );
}
