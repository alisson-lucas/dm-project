import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCatalog } from "@/services/catalog";
import { ExploreBrowser } from "@/components/ExploreBrowser";
import {
  btnPrimary,
  featureActions,
  featureBg,
  featureCard,
  featureContent,
  featureImg,
  featureKicker,
  featureScrim,
  featureTitle,
} from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ estilo?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app/explorar");

  const [{ all }, { estilo, q }] = await Promise.all([
    getCatalog(user.id),
    searchParams,
  ]);
  const featured = all[0] ?? null;

  return (
    <>
      <main className="max-w-page mx-auto px-[clamp(16px,4vw,48px)] pb-20 pt-[clamp(24px,4vw,40px)]">
        <p className="mb-3 text-[0.78rem] uppercase tracking-[0.17em] text-text-faint">
          catálogo · {all.length} {all.length === 1 ? "curso" : "cursos"}
        </p>

        {featured ? (
          <section className={featureCard}>
            <div className={featureBg} aria-hidden>
              {featured.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.coverImageUrl}
                  alt=""
                  className={featureImg}
                />
              ) : null}
            </div>
            <div className={featureScrim} aria-hidden />

            <div className={featureContent}>
              <p className={featureKicker}>Em destaque</p>
              <h2 className={featureTitle}>{featured.title}</h2>
              {featured.description ? (
                <p className="mt-2.5 max-w-[46ch] text-[0.9rem] leading-[1.55] text-text-dim">
                  {featured.description}
                </p>
              ) : null}
              <div className={featureActions}>
                <Link
                  href={`/app/courses/${featured.slug}`}
                  className={btnPrimary}
                >
                  Ver curso
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {all.length === 0 ? (
          <p className="mt-8 max-w-[48ch] leading-[1.6] text-text-dim">
            Nenhum curso cadastrado ainda.
          </p>
        ) : (
          <ExploreBrowser courses={all} initialCategory={estilo} initialQuery={q} />
        )}
      </main>
    </>
  );
}
