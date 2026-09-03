import Link from "next/link";
import type { TrailModule, TrailStatus } from "../services/home";
import { plural } from "../lib/format";
import { scroller } from "../lib/ui";

const TAG: Record<TrailStatus, string> = {
  done: "Concluída",
  current: "Em curso",
  next: "A seguir",
};

const TAG_TONE: Record<TrailStatus, string> = {
  done: "text-success",
  current: "text-accent-2",
  next: "text-text-faint",
};

const DOT: Record<TrailStatus, string> = {
  done: "border-success bg-success",
  current: "border-accent-2",
  next: "border-white/20",
};

export function TrailStrip({
  modules,
  courseSlug,
}: {
  modules: TrailModule[];
  courseSlug: string;
}) {
  return (
    <div className={scroller}>
      {modules.map((m) => (
        <Link
          key={m.id}
          href={`/courses/${courseSlug}`}
          className={`w-[190px] flex-none snap-start rounded-xl border bg-surface px-[17px] py-[15px] transition-colors hover:border-accent/60 ${
            m.status === "current" ? "border-accent" : "border-white/8"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[0.6rem] font-bold uppercase tracking-[0.13em] ${TAG_TONE[m.status]}`}
            >
              {TAG[m.status]}
            </span>
            <span
              className={`h-4 w-4 flex-none rounded-full border-[1.5px] ${DOT[m.status]}`}
            />
          </div>

          <div
            className={`mt-3.5 text-[0.88rem] font-semibold leading-[1.3] ${
              m.status === "next" ? "text-text-dim" : "text-text"
            }`}
          >
            {m.title}
          </div>

          <div className="mt-2 text-[0.7rem] tracking-[0.04em] text-text-faint">
            {[plural(m.lessonCount, "aula"), m.durationLabel]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </Link>
      ))}
    </div>
  );
}
