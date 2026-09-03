import Link from "next/link";
import type { CatalogCourse } from "../services/catalog";
import { ExploreCard } from "./ExploreCard";
import { scroller, sectionTitle } from "../lib/ui";

// Fileira de cursos com título e um atalho opcional pro catálogo.
export function CourseRow({
  title,
  items,
  catalogHref,
}: {
  title: string;
  items: CatalogCourse[];
  catalogHref?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3 className={sectionTitle}>{title}</h3>
        {catalogHref ? (
          <Link
            href={catalogHref}
            className="flex-none text-[0.78rem] font-medium text-accent-2 hover:text-text"
          >
            Ver catálogo →
          </Link>
        ) : null}
      </div>

      <div className={scroller}>
        {items.map((course) => (
          <ExploreCard key={course.id} course={course} layout="row" />
        ))}
      </div>
    </section>
  );
}
