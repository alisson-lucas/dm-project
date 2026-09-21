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

  // ------------------------------------------------------------- pôster
  // Card retrato, no formato da referência que o cliente mandou: a foto ocupa
  // o card inteiro e o TÍTULO fica por cima dela, grande. Isso resolve de
  // quebra o problema de todos os cursos dividirem a mesma capa — o que
  // diferencia um card do outro passa a ser a tipografia, não a imagem.
  if (layout === "row") {
    return (
      <Link
        href={`/app/courses/${course.slug}`}
        data-locked={!course.enrolled}
        className="group w-[168px] flex-none snap-start sm:w-[190px]"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#2a1a22,#141018)] transition duration-300 group-hover:border-accent/60 group-hover:shadow-[0_22px_48px_-18px_rgba(0,0,0,0.85)]">
          {course.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.coverImageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-[center_22%] transition-transform duration-500 group-hover:scale-[1.06] group-data-[locked=true]:saturate-[0.65]"
            />
          ) : null}

          {/* o degradê é o que sustenta o título: sem ele a legibilidade
              depende da foto, e a foto muda de curso pra curso */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,11,0.96)_4%,rgba(8,8,11,0.72)_34%,rgba(8,8,11,0.12)_68%,transparent)]"
          />

          {level ? (
            <span
              className={`absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.09em] backdrop-blur-sm ${
                LEVEL_TONE[course.level ?? ""] ?? "text-text-dim"
              }`}
            >
              {level}
            </span>
          ) : null}

          {!course.enrolled ? (
            <span
              aria-label="Curso não comprado"
              className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[0.62rem] backdrop-blur-sm"
            >
              🔒
            </span>
          ) : null}

          <span className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5">
            {course.category ? (
              <span className="mb-1.5 block text-[0.56rem] font-bold uppercase tracking-[0.15em] text-accent-2">
                {course.category}
              </span>
            ) : null}
            <span className="block text-[0.95rem] font-extrabold uppercase leading-[1.06] tracking-[-0.015em]">
              {course.title}
            </span>
          </span>
        </div>

        <span className="mt-2 block text-[0.72rem] text-text-faint">
          {courseCardMeta(course.lessonCount, course.durationSeconds)}
        </span>
      </Link>
    );
  }

  // --------------------------------------------------------------- grade
  return (
    <Link
      href={`/app/courses/${course.slug}`}
      data-locked={!course.enrolled}
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-white/8 bg-surface transition duration-200 hover:-translate-y-[3px] hover:border-accent/60 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)]"
    >
      <div className="relative flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#2a1a22,#141018)] group-data-[locked=true]:saturate-[0.7]">
        {course.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImageUrl}
            alt=""
            loading="lazy"
            // `absolute inset-0` e não `h-full`: altura percentual não
            // resolve dentro de um container que só tem aspect-ratio, então a
            // imagem assumia a altura natural e ESTICAVA o card. Com as
            // thumbnails 16:9 antigas isso passava batido porque coincidia
            // com o aspect-video; com a capa retrato o card virava retrato.
            //
            // object-[center_26%] sobe o enquadramento: cortada em 16:9 pelo
            // centro, a capa pegaria só o tronco e deixaria o rosto de fora.
            className="absolute inset-0 h-full w-full object-cover object-[center_26%] group-data-[locked=true]:opacity-50"
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
        <span className="text-[0.95rem] font-semibold leading-[1.3]">
          {course.title}
        </span>

        {course.description ? (
          <span className="line-clamp-2 flex-1 text-[0.8rem] leading-[1.5] text-text-dim">
            {course.description}
          </span>
        ) : null}

        <span className="mt-1.5 border-t border-white/8 pt-2.5 text-[0.72rem] text-text-faint">
          {courseCardMeta(course.lessonCount, course.durationSeconds)}
        </span>
      </div>
    </Link>
  );
}
