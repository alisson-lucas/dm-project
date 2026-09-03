import Link from "next/link";
import { after } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import { getLessonPlayerForUser } from "../../../services/lessonAccess";
import { markLessonWatched } from "../../../services/progress";
import { formatDuration } from "../../../lib/format";
import { TopBar } from "../../../components/TopBar";
import { backLink, btnGhost, deniedWrap } from "../../../lib/ui";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // O middleware já barra quem não tem sessão; aqui é a checagem de verdade
  // (usuário existe + matrícula ativa no curso da aula).
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/lessons/${id}`);

  const result = await getLessonPlayerForUser(id, user.id);

  if (!result.ok && result.status === 404) notFound();

  if (!result.ok) {
    return (
      <>
        <TopBar email={user.email} />
        <main className={deniedWrap}>
          <h1 className="mb-2.5 text-[1.6rem] font-bold">Acesso não liberado</h1>
          <p className="text-text-dim">{result.message}</p>
          <p className="mt-6">
            <Link href="/" className={btnGhost}>
              Voltar ao início
            </Link>
          </p>
        </main>
      </>
    );
  }

  const { embed, lesson, siblings } = result;

  // Alimenta o "Continue de onde parou" da home. Roda depois da resposta, então
  // não atrasa o player.
  after(() => markLessonWatched(user.id, lesson.courseId, lesson.id));

  return (
    <>
      <TopBar email={user.email} />
      <main className="max-w-[1200px] mx-auto px-[clamp(16px,4vw,48px)] pb-16 pt-[calc(4rem+24px)]">
        <Link href={`/courses/${lesson.courseSlug}`} className={backLink}>
          ← {lesson.courseTitle}
        </Link>

        <div className="grid grid-cols-1 gap-7 min-[960px]:grid-cols-[1fr_320px] min-[960px]:items-start">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <iframe
                src={embed.embedUrl}
                title={lesson.title}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
            <div className="mt-[22px]">
              <p className="mb-1.5 text-[0.76rem] font-bold uppercase tracking-[0.14em] text-accent-2">
                {lesson.moduleTitle}
              </p>
              <h1 className="text-[clamp(1.3rem,3vw,1.9rem)] font-extrabold">
                {lesson.title}
              </h1>
              <p className="mt-2.5 text-[0.8rem] text-text-faint">
                provedor: {embed.provider}
              </p>
            </div>
          </div>

          <aside className="overflow-hidden rounded-xl border border-white/8">
            <div className="border-b border-white/8 bg-bg-2 px-4 py-3.5 text-[0.9rem] font-bold">
              {lesson.moduleTitle}
            </div>
            {siblings.map((s, i) => {
              const dur = formatDuration(s.durationSeconds);
              return (
                <Link
                  key={s.id}
                  href={`/lessons/${s.id}`}
                  aria-current={s.id === lesson.id}
                  className="flex gap-2.5 border-b border-white/8 px-4 py-3 text-[0.86rem] text-text-dim last:border-b-0 hover:bg-surface hover:text-text aria-[current=true]:border-l-[3px] aria-[current=true]:border-l-accent aria-[current=true]:bg-accent/[0.14] aria-[current=true]:pl-[13px] aria-[current=true]:text-text"
                >
                  <span className="min-w-[1.5em] text-text-faint">{i + 1}</span>
                  <span>{s.title}</span>
                  {dur ? (
                    <span className="ml-auto whitespace-nowrap text-[0.78rem] text-text-faint">
                      {dur}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </aside>
        </div>
      </main>
    </>
  );
}
