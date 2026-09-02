import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { getCatalog } from "../services/catalog";
import { TopBar } from "../components/TopBar";
import { HeroCarousel } from "../components/HeroCarousel";
import { CourseCard } from "../components/CourseCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { all, enrolled } = await getCatalog(user.id);

  if (all.length === 0) {
    return (
      <>
        <TopBar email={user.email} />
        <main className="nf-catalog">
          <header className="nf-catalog-head">
            <p className="nf-catalog-hi">Olá, {user.name ?? user.email}</p>
            <h1>Cursos</h1>
          </header>
          <p className="nf-catalog-empty">Nenhum curso cadastrado ainda.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar email={user.email} />
      <main>
        <HeroCarousel courses={all} />

        <div className="nf-catalog nf-catalog--after-hero">
          <header className="nf-catalog-head">
            <p className="nf-catalog-hi">Olá, {user.name ?? user.email}</p>
            <h1>{enrolled.length > 0 ? "Seus cursos" : "Cursos"}</h1>
          </header>

          {enrolled.length > 0 ? (
            <div className="nf-course-grid">
              {enrolled.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="nf-catalog-empty">
              Você ainda não tem nenhum curso liberado. Escolha um acima — o
              acesso é liberado após a compra na Hotmart.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
