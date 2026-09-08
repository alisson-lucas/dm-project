import Link from "next/link";
import type { ContinueWatching } from "../services/home";
import {
  btnGhost,
  btnPrimary,
  featureActions,
  featureBg,
  featureCard,
  featureContent,
  featureImg,
  featureKicker,
  featureMeta,
  featureScrim,
  featureTitle,
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
    <section className={featureCard}>
      <div className={featureBg} aria-hidden>
        {data.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.coverImageUrl} alt="" className={featureImg} />
        ) : null}
      </div>
      <div className={featureScrim} aria-hidden />

      <div className={featureContent}>
        <p className={featureKicker}>
          {data.fresh ? "Comece por aqui" : "Continue de onde parou"}
        </p>
        <h1 className={featureTitle}>{data.lessonTitle}</h1>
        <p className={featureMeta}>{meta}</p>

        <div className={featureActions}>
          <Link href={`/app/lessons/${data.lessonId}`} className={btnPrimary}>
            ▶ {data.fresh ? "Começar aula" : "Retomar aula"}
          </Link>
          <Link href={`/app/courses/${data.courseSlug}`} className={btnGhost}>
            Ver a trilha
          </Link>
        </div>

        <div
          className="mt-5 h-[3px] w-[min(340px,100%)] overflow-hidden rounded-full bg-white/12"
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
