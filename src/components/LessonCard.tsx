import Link from "next/link";
import type { Lesson } from "@prisma/client";
import { formatDuration, youtubeThumb } from "../lib/format";

export function LessonCard({
  lesson,
  badge,
}: {
  lesson: Lesson;
  badge?: string;
}) {
  const duration = formatDuration(lesson.durationSeconds);
  const thumb =
    lesson.videoProvider === "YOUTUBE"
      ? youtubeThumb(lesson.videoExternalId)
      : null;

  return (
    <Link href={`/lessons/${lesson.id}`} className="nf-card">
      <div className="nf-card-thumb">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" />
        ) : (
          <span className="nf-card-thumb-fallback">{lesson.videoProvider}</span>
        )}
        {badge ? <span className="nf-card-badge">{badge}</span> : null}
        <span className="nf-card-play" aria-hidden>
          ▶
        </span>
      </div>
      <div className="nf-card-body">
        <span className="nf-card-title">{lesson.title}</span>
        {duration ? <span className="nf-card-dur">{duration}</span> : null}
      </div>
    </Link>
  );
}
