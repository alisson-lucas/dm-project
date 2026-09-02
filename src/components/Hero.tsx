import Link from "next/link";
import type { Lesson } from "@prisma/client";
import type { CourseWithModules } from "../services/catalog";
import { courseMeta, youtubeThumb } from "../lib/format";

export function Hero({
  course,
  firstLesson,
}: {
  course: CourseWithModules;
  firstLesson: Lesson | null;
}) {
  const lessonCount = course.modules.reduce(
    (n, m) => n + m.lessons.length,
    0
  );
  const meta = courseMeta(course.modules.length, lessonCount);

  const bg =
    course.coverImageUrl ??
    (firstLesson?.videoProvider === "YOUTUBE"
      ? youtubeThumb(firstLesson.videoExternalId)
      : null);

  return (
    <section className="nf-hero">
      <div
        className="nf-hero-bg"
        aria-hidden
        style={bg ? { backgroundImage: `url(${bg})` } : undefined}
      />
      <div className="nf-hero-content">
        <p className="nf-hero-kicker">Continue de onde parou</p>
        <h1 className="nf-hero-title">{course.title}</h1>
        {course.description ? (
          <p className="nf-hero-desc">{course.description}</p>
        ) : null}
        <p className="nf-hero-meta">{meta}</p>
        <div className="nf-hero-actions">
          {firstLesson ? (
            <Link
              href={`/lessons/${firstLesson.id}`}
              className="nf-btn nf-btn-primary"
            >
              ▶ Assistir
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
