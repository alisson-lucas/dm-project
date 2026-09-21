import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getHome } from "@/services/home";
import { HomeHero, type HeroSlide } from "@/components/HomeHero";
import { TrailStrip } from "@/components/TrailStrip";
import { CourseRow } from "@/components/CourseRow";
import { SITE_NAME } from "@/lib/site";
import { plural } from "@/lib/format";
import { rowWrap, sectionTitle } from "@/lib/ui";

export const dynamic = "force-dynamic";

// Slide de boas-vindas. A imagem é um caminho comum em /public, então trocar
// esta foto por um banner desenhado (o do print que o cliente mandou, por
// exemplo) é editar a linha abaixo — sem tocar no carrossel.
const IMAGEM_BOAS_VINDAS = "/images/landing/professor-sobre.jpeg";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");

  const { myCourses, recommended, continueWatching } = await getHome(user.id);

  // Nem curso comprado, nem curso pra recomendar = catálogo vazio.
  if (myCourses.length === 0 && recommended.length === 0) {
    return (
      <main className={`${rowWrap} pb-20 pt-[clamp(24px,4vw,40px)]`}>
        <h1 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold">
          Cursos
        </h1>
        <p className="mt-3 max-w-[48ch] leading-[1.6] text-text-dim">
          Nenhum curso cadastrado ainda.
        </p>
      </main>
    );
  }

  const temCursos = myCourses.length > 0;

  // ------------------------------------------------------------- destaques
  // A ordem é a que o cliente pediu: boas-vindas primeiro, depois o que dá
  // pra fazer agora. Vale saber que isso deixa o "retomar aula" a um slide de
  // distância — para quem já é aluno, ele é a ação mais útil da tela.
  const slides: HeroSlide[] = [
    {
      id: "boas-vindas",
      kicker: temCursos ? "Bem-vindo de volta" : "Bem-vindo",
      title: `Sua trilha de guitarra começa no ${SITE_NAME}`,
      meta: temCursos
        ? `Você tem ${plural(myCourses.length, "curso")} liberado${myCourses.length === 1 ? "" : "s"}.`
        : "O acesso é liberado automaticamente após a compra.",
      image: IMAGEM_BOAS_VINDAS,
      cta: temCursos
        ? { href: "#seus-cursos", label: "Ver meus cursos" }
        : { href: "/app/explorar", label: "Explorar catálogo" },
      secondary: { href: "/app/explorar", label: "Explorar catálogo" },
    },
  ];

  if (continueWatching) {
    slides.push({
      id: "continuar",
      kicker: continueWatching.fresh ? "Comece por aqui" : "Continue de onde parou",
      title: continueWatching.lessonTitle,
      meta: [
        continueWatching.courseTitle,
        `Aula ${continueWatching.lessonNumber} de ${continueWatching.lessonTotal}`,
        continueWatching.lessonDurationLabel,
      ]
        .filter(Boolean)
        .join(" · "),
      image: continueWatching.coverImageUrl,
      cta: {
        href: `/app/lessons/${continueWatching.lessonId}`,
        label: continueWatching.fresh ? "Começar aula" : "Retomar aula",
      },
      secondary: {
        href: `/app/courses/${continueWatching.courseSlug}`,
        label: "Ver a trilha",
      },
      percent: continueWatching.percent,
    });
  }

  // Cursos em destaque: os que o aluno ainda NÃO tem. Anunciar no banner um
  // curso já comprado é gastar o espaço mais nobre da tela com quem já pagou.
  for (const curso of recommended.slice(0, 3)) {
    slides.push({
      id: curso.id,
      kicker: [curso.category, "Em destaque"].filter(Boolean).join(" · "),
      title: curso.title,
      meta: curso.description,
      image: curso.coverImageUrl,
      cta: { href: `/app/courses/${curso.slug}`, label: "Ver curso" },
    });
  }

  return (
    <>
      <main className={`${rowWrap} pb-20 pt-[clamp(24px,4vw,40px)]`}>
        <HomeHero slides={slides} />

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

          <div id="seus-cursos" className="scroll-mt-24">
            <CourseRow title="Seus cursos" items={myCourses} />
          </div>

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
