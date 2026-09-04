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
  heroActions,
  heroBg,
  heroContent,
  heroKicker,
  heroMeta,
  heroTitle,
  rowWrap,
  sectionTitle,
} from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");

  const { all, continueWatching, recommended, categoryRows } = await getHome(
    user.id
  );

  if (all.length === 0) {
    return (
      <>
        <TopBar email={user.email} />
        <main className="max-w-page mx-auto px-[clamp(16px,4vw,48px)] pb-20 pt-[calc(4rem+40px)]">
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

  return (
    <>
      <TopBar email={user.email} />
      <main>
        {continueWatching ? (
          <ContinueHero data={continueWatching} />
        ) : (
          // Sem matrícula ativa não há "de onde parou" — o hero vira convite
          // pro catálogo.
          <section className="relative flex min-h-[min(64vh,520px)] items-end overflow-hidden">
            <div className={heroBg} aria-hidden />
            <div className={`${heroContent} pb-[clamp(36px,7vw,88px)]`}>
              <p className={heroKicker}>Comece agora</p>
              <h1 className={heroTitle}>Escolha seu primeiro curso</h1>
              <p className={heroMeta}>
                O acesso é liberado automaticamente após a compra na Hotmart.
              </p>
              <div className={heroActions}>
                <Link href="/app/explorar" className={btnGhost}>
                  Explorar catálogo
                </Link>
              </div>
            </div>
          </section>
        )}

        <div
          className={`${rowWrap} mt-[clamp(24px,4vw,40px)] flex flex-col gap-[clamp(28px,4.5vw,48px)] pb-20`}
        >
          {continueWatching && continueWatching.modules.length > 0 ? (
            <section>
              <h3 className={`${sectionTitle} mb-3`}>Seu histórico</h3>
              <TrailStrip
                modules={continueWatching.modules}
                courseSlug={continueWatching.courseSlug}
              />
            </section>
          ) : null}

          <CourseRow
            title="Recomendado para você"
            items={recommended}
            catalogHref="/app/explorar"
          />

          {categoryRows.map((row) => (
            <CourseRow
              key={row.category}
              title={row.title}
              items={row.items}
              catalogHref={`/app/explorar?estilo=${encodeURIComponent(row.category)}`}
            />
          ))}
        </div>
      </main>
    </>
  );
}
