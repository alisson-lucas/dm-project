import type { CourseModule } from "../services/catalog";
import { LessonCard } from "./LessonCard";

export function LessonRow({
  module,
  index,
}: {
  module: CourseModule;
  index: number;
}) {
  if (module.lessons.length === 0) return null;

  return (
    <section className="nf-row">
      <h2 className="nf-row-title">{module.title}</h2>
      <div className="nf-row-scroller row-scroller">
        {module.lessons.map((lesson, i) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            badge={`${index + 1}.${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
