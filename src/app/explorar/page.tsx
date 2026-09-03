import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import { getCatalog } from "../../services/catalog";
import { TopBar } from "../../components/TopBar";
import { ExploreBrowser } from "../../components/ExploreBrowser";
import { btnPrimary } from "../../lib/ui";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ estilo?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/explorar");

  const [{ all }, { estilo }] = await Promise.all([
    getCatalog(user.id),
    searchParams,
  ]);
  const featured = all[0] ?? null;

  return (
    <>
      <TopBar email={user.email} />
      <main className="max-w-page mx-auto px-[clamp(16px,4vw,48px)] pb-20 pt-[calc(4rem+40px)]">
        <p className="mb-3 text-[0.78rem] uppercase tracking-[0.17em] text-text-faint">
          catálogo · {all.length} {all.length === 1 ? "curso" : "cursos"}
        </p>

        {featured ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/8">
            <div className="aspect-[16/6] bg-[radial-gradient(120%_120%_at_85%_0%,rgba(158,34,76,0.4),transparent_60%),linear-gradient(135deg,#2a1a22,#141018)]">
              {featured.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover opacity-40"
                />
              ) : null}
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg)_6%,rgba(11,11,15,0.35)_55%,transparent_85%)]" />
            <div className="absolute inset-x-0 bottom-0 max-w-[520px] p-[clamp(20px,4vw,44px)]">
              <p className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-accent-2">
                Em destaque
              </p>
              <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-[1.05]">
                {featured.title}
              </h2>
              {featured.description ? (
                <p className="mt-2.5 max-w-[46ch] text-[0.9rem] leading-[1.55] text-text-dim">
                  {featured.description}
                </p>
              ) : null}
              <Link
                href={`/courses/${featured.slug}`}
                className={`${btnPrimary} mt-4`}
              >
                Ver curso
              </Link>
            </div>
          </div>
        ) : null}

        {all.length === 0 ? (
          <p className="mt-8 max-w-[48ch] leading-[1.6] text-text-dim">
            Nenhum curso cadastrado ainda.
          </p>
        ) : (
          <ExploreBrowser courses={all} initialCategory={estilo} />
        )}
      </main>
    </>
  );
}
