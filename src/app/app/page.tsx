import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHome } from "@/services/home";
import { TopBar } from "@/components/TopBar";
import { ContinueHero } from "@/components/ContinueHero";
import { TrailStrip } from "@/components/TrailStrip";
import { CourseRow } from "@/components/CourseRow";
import {
  btnGhost,
  featureActions,
  featureBg,
  featureCard,
  featureContent,
  featureKicker,
  featureMeta,
  featureScrim,
  featureTitle,
  rowWrap,
  sectionTitle,
} from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");

  const { myCourses, recommended, continueWatching } = await getHome(user.id);

  // Nem curso comprado, nem curso pra recomendar = catálogo vazio.
  if (myCourses.length === 0 && recommended.length === 0) {
    return (
      <>
        <TopBar email={user.email} />
        <main className={`${rowWrap} pb-20 pt-[calc(4rem+40px)]`}>
          <h1 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold">
            Cursos
          </h1>
          <p className="mt-3 max-w-[48ch] leading-[1.6] text-text-dim">
            Nenhum curso cadastrado ainda.
          </p>
        </main>
      </>
    );
  }

  const hasCourses = myCourses.length > 0;

  return (
    <>
      <TopBar email={user.email} />
      <main className={`${rowWrap} pb-20 pt-[calc(4rem+40px)]`}>
        {continueWatching ? (
          <ContinueHero data={continueWatching} />
        ) : (
          // Mesmo cartão do "continue de onde parou", sem capa: ainda não há
          // aula aberta pra retomar.
          <section className={featureCard}>
            <div className={featureBg} aria-hidden />
            <div className={featureScrim} aria-hidden />
            <div className={featureContent}>
              <p className={featureKicker}>
                {hasCourses ? "Bem-vindo de volta" : "Comece agora"}
              </p>
              <h1 className={featureTitle}>
                {hasCourses
                  ? "Escolha por onde começar"
                  : "Escolha seu primeiro curso"}
              </h1>
              <p className={featureMeta}>
                {hasCourses
                  ? "Seus cursos estão logo abaixo."
                  : "O acesso é liberado automaticamente após a compra na Hotmart."}
              </p>
              {!hasCourses ? (
                <div className={featureActions}>
                  <Link href="/app/explorar" className={btnGhost}>
                    Explorar catálogo
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        )}

        <div className="mt-[clamp(28px,4vw,44px)] flex flex-col gap-[clamp(28px,4.5vw,48px)]">
          {continueWatching && continueWatching.modules.length > 0 ? (
            <section>
              <h3 className={`${sectionTitle} mb-3`}>Seu histórico</h3>
              <TrailStrip
                modules={continueWatching.modules}
                courseSlug={continueWatching.courseSlug}
              />
            </section>
          ) : null}

          <CourseRow title="Seus cursos" items={myCourses} />

          <CourseRow
            title="Recomendado para você"
            items={recommended}
            catalogHref="/app/explorar"
          />
        </div>
      </main>
    </>
  );
}
