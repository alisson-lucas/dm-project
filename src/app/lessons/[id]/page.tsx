import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import { getLessonPlayerForUser } from "../../../services/lessonAccess";
import { formatDuration } from "../../../lib/format";
import { TopBar } from "../../../components/TopBar";

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
        <main className="nf-denied">
          <h1>Acesso não liberado</h1>
          <p>{result.message}</p>
          <p style={{ marginTop: 24 }}>
            <Link href="/" className="nf-btn nf-btn-ghost">
              Voltar ao início
            </Link>
          </p>
        </main>
      </>
    );
  }

  const { embed, lesson, siblings } = result;

  return (
    <>
      <TopBar email={user.email} />
      <main className="nf-player">
        <Link href={`/courses/${lesson.courseSlug}`} className="nf-back">
          ← {lesson.courseTitle}
        </Link>

        <div className="nf-player-layout">
          <div>
            <div className="nf-player-stage">
              <iframe
                src={embed.embedUrl}
                title={lesson.title}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            </div>
            <div className="nf-player-head">
              <p className="nf-player-kicker">{lesson.moduleTitle}</p>
              <h1 className="nf-player-title">{lesson.title}</h1>
              <p className="nf-player-note">provedor: {embed.provider}</p>
            </div>
          </div>

          <aside className="nf-playlist">
            <div className="nf-playlist-h">{lesson.moduleTitle}</div>
            {siblings.map((s, i) => {
              const dur = formatDuration(s.durationSeconds);
              return (
                <Link
                  key={s.id}
                  href={`/lessons/${s.id}`}
                  aria-current={s.id === lesson.id}
                >
                  <span className="nf-playlist-num">{i + 1}</span>
                  <span>{s.title}</span>
                  {dur ? <span className="nf-playlist-dur">{dur}</span> : null}
                </Link>
              );
            })}
          </aside>
        </div>
      </main>
    </>
  );
}
