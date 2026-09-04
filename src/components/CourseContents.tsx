"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  CoursePageModule,
  ProgressStatus,
} from "../services/coursePage";
import { plural } from "../lib/format";

const BADGE: Record<ProgressStatus, string> = {
  done: "bg-surface-2 text-success",
  current: "bg-accent text-white",
  next: "bg-surface-2 text-text-faint",
};

const DOT: Record<ProgressStatus, string> = {
  done: "border-success bg-success",
  current: "border-accent-2",
  next: "border-white/20",
};

export function CourseContents({ modules }: { modules: CoursePageModule[] }) {
  // abre no módulo em andamento; clicar de novo no mesmo fecha
  const [openId, setOpenId] = useState<string | null>(
    () => modules.find((m) => m.status === "current")?.id ?? null
  );

  return (
    <div className="flex flex-col gap-2.5">
      {modules.map((m) => {
        const open = m.id === openId;
        return (
          <div
            key={m.id}
            className="overflow-hidden rounded-xl border border-white/8 bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : m.id)}
              aria-expanded={open}
              className="flex w-full cursor-pointer items-center gap-4 px-5 py-[17px] text-left transition-colors hover:bg-surface-2"
            >
              <span
                className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg text-[0.7rem] font-bold tabular-nums ${BADGE[m.status]}`}
              >
                {m.number}
              </span>

              <span
                className={`flex-1 text-[0.9rem] font-semibold ${
                  m.status === "next" ? "text-text-dim" : "text-text"
                }`}
              >
                {m.title}
              </span>

              <span className="flex-none text-[0.7rem] tracking-[0.04em] text-text-faint max-sm:hidden">
                {[plural(m.lessonCount, "aula"), m.durationLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </span>

              <span
                aria-hidden
                className="w-3 flex-none text-center text-[0.85rem] text-text-faint"
              >
                {open ? "–" : "+"}
              </span>
            </button>

            {open ? (
              <div className="flex flex-col">
                {m.lessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/app/lessons/${l.id}`}
                    aria-current={l.status === "current"}
                    className="flex items-center gap-3.5 border-t border-white/8 py-3 pl-[22px] pr-5 transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={`h-[15px] w-[15px] flex-none rounded-full border-[1.5px] ${DOT[l.status]}`}
                    />
                    <span
                      className={`flex-1 text-[0.84rem] ${
                        l.status === "done" ? "text-text-dim" : "text-text"
                      }`}
                    >
                      {l.title}
                    </span>
                    {l.durationLabel ? (
                      <span className="flex-none text-[0.7rem] tabular-nums text-text-faint">
                        {l.durationLabel}
                      </span>
                    ) : null}
                  </Link>
                ))}

                {m.lessons.length === 0 ? (
                  <p className="border-t border-white/8 px-[22px] py-3 text-[0.8rem] text-text-faint">
                    Nenhuma aula neste módulo ainda.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
