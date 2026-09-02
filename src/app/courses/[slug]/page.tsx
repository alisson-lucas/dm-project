import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import { getCourseForUser } from "../../../services/catalog";
import { TopBar } from "../../../components/TopBar";
import { Hero } from "../../../components/Hero";
import { LessonRow } from "../../../components/LessonRow";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/courses/${slug}`);

  const result = await getCourseForUser(user.id, slug);

  if (result.status === "not-found") notFound();

  if (result.status === "forbidden") {
    return (
      <>
        <TopBar email={user.email} />
        <main className="nf-denied">
          <h1>Você ainda não tem este curso</h1>
          <p>
            O acesso é liberado automaticamente após a compra na Hotmart. Se você
            já comprou, aguarde alguns minutos e recarregue.
          </p>
          <p style={{ marginTop: 24 }}>
            <Link href="/" className="nf-btn nf-btn-ghost">
              Voltar ao catálogo
            </Link>
          </p>
        </main>
      </>
    );
  }

  const { course, firstLesson } = result;

  return (
    <>
      <TopBar email={user.email} />
      <main>
        <Hero course={course} firstLesson={firstLesson} />
        <div className="nf-rows">
          <div className="nf-row">
            <Link href="/" className="nf-back">
              ← Meus cursos
            </Link>
          </div>
          {course.modules.map((module, i) => (
            <LessonRow key={module.id} module={module} index={i} />
          ))}
        </div>
      </main>
    </>
  );
}
