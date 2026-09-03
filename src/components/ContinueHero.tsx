import Link from "next/link";
import type { ContinueWatching } from "../services/home";
import {
  btnGhost,
  btnPrimary,
  heroActions,
  heroBg,
  heroContent,
  heroKicker,
  heroMeta,
  heroTitle,
} from "../lib/ui";

export function ContinueHero({ data }: { data: ContinueWatching }) {
  const meta = [
    data.courseTitle,
    `Aula ${data.lessonNumber} de ${data.lessonTotal}`,
    data.lessonDurationLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="relative flex min-h-[min(74vh,620px)] items-end overflow-hidden">
      <div
        className={heroBg}
        aria-hidden
        style={
          data.coverImageUrl
            ? { backgroundImage: `url(${data.coverImageUrl})` }
            : undefined
        }
      />
      <div className={`${heroContent} pb-[clamp(36px,7vw,88px)]`}>
        <p className={heroKicker}>
          {data.fresh ? "Comece por aqui" : "Continue de onde parou"}
        </p>
        <h1 className={heroTitle}>{data.lessonTitle}</h1>
        <p className={heroMeta}>{meta}</p>

        <div className={heroActions}>
          <Link href={`/lessons/${data.lessonId}`} className={btnPrimary}>
            ▶ {data.fresh ? "Começar aula" : "Retomar aula"}
          </Link>
          <Link href={`/courses/${data.courseSlug}`} className={btnGhost}>
            Ver a trilha
          </Link>
        </div>

        <div
          className="mt-6 h-[3px] w-[min(340px,100%)] overflow-hidden rounded-full bg-white/12"
          role="progressbar"
          aria-valuenow={data.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${data.percent}% do curso concluído`}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${data.percent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
