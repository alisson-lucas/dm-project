import Link from "next/link";
import type { CatalogCourse } from "../services/catalog";
import { courseMeta } from "../lib/format";

export function CourseCard({ course }: { course: CatalogCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="nf-course-card"
      data-locked={!course.enrolled}
    >
      <div className="nf-course-cover">
        {course.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.coverImageUrl} alt="" loading="lazy" />
        ) : (
          <span className="nf-course-cover-fallback">{course.title}</span>
        )}
        {!course.enrolled ? (
          <span className="nf-course-lock">🔒 não matriculado</span>
        ) : null}
        <span className="nf-course-play" aria-hidden>
          ▶
        </span>
      </div>
      <div className="nf-course-body">
        <span className="nf-course-title">{course.title}</span>
        <span className="nf-course-meta">
          {courseMeta(course.moduleCount, course.lessonCount)}
        </span>
      </div>
    </Link>
  );
}
