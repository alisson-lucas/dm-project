import Link from "next/link";
import type { CatalogCourse } from "../services/catalog";
import { courseCardMeta, courseLevelLabel } from "../lib/format";

const LEVEL_TONE: Record<string, string> = {
  BEGINNER: "text-accent-2",
  INTERMEDIATE: "text-text-dim",
  ADVANCED: "text-text",
};

export function ExploreCard({
  course,
  layout,
}: {
  course: CatalogCourse;
  layout: "row" | "grid";
}) {
  const level = courseLevelLabel(course.level);

  return (
    <Link
      href={`/app/courses/${course.slug}`}
      data-locked={!course.enrolled}
      className={`group flex flex-col overflow-hidden rounded-lg border border-white/8 bg-surface transition duration-200 hover:-translate-y-[3px] hover:border-accent/60 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)] ${
        layout === "row" ? "w-[230px] flex-none snap-start" : "w-full"
      }`}
    >
      <div className="relative flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#2a1a22,#141018)] group-data-[locked=true]:saturate-[0.7]">
        {course.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImageUrl}
            alt=""
            loading="lazy"
            className="block h-full w-full object-cover group-data-[locked=true]:opacity-50"
          />
        ) : (
          <span className="px-3 text-center text-[0.72rem] uppercase tracking-[0.12em] text-text-faint">
            {course.title}
          </span>
        )}
        {level ? (
          <span
            className={`absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.09em] ${
              LEVEL_TONE[course.level ?? ""] ?? "text-text-dim"
            }`}
          >
            {level}
          </span>
        ) : null}
        {!course.enrolled ? (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[0.62rem] font-semibold text-text-dim">
            🔒
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
        <span
          className={`font-semibold leading-[1.3] ${
            layout === "row"
              ? "truncate text-[0.9rem]"
              : "text-[0.95rem]"
          }`}
        >
          {course.title}
        </span>

        {layout === "grid" && course.description ? (
          <span className="line-clamp-2 flex-1 text-[0.8rem] leading-[1.5] text-text-dim">
            {course.description}
          </span>
        ) : null}

        <span
          className={`text-[0.72rem] text-text-faint ${
            layout === "grid" ? "mt-1.5 border-t border-white/8 pt-2.5" : ""
          }`}
        >
          {courseCardMeta(course.lessonCount, course.durationSeconds)}
        </span>
      </div>
    </Link>
  );
}
