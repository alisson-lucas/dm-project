import { SITE_NAME } from "../lib/site";

// Selo circular da marca. Nasceu na seção de oferta e virou o símbolo do
// projeto, então mora aqui (fora de components/landing) porque a área logada
// também usa.
//
// O monograma sai da primeira palavra do SITE_NAME — "DM PROJECT" vira "DM".
// Trocar a marca em src/lib/site.ts leva o selo junto.
const MONOGRAM = SITE_NAME.split(" ")[0];
const RING_TEXT = `${SITE_NAME} · ACESSO IMEDIATO · `.repeat(2);

export function BrandMark({
  className = "",
  ringText = false,
  monogramClass = "",
}: {
  className?: string;
  /** texto correndo pela circunferência — só legível acima de ~80px, então
   *  fica desligado nos tamanhos de cabeçalho */
  ringText?: boolean;
  /** permite tingir o monograma diferente do anel (usado no selo grande) */
  monogramClass?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={`flex-none ${className}`}
    >
      <circle
        cx="50"
        cy="50"
        r={ringText ? 48 : 46}
        fill="none"
        stroke="currentColor"
        strokeWidth={ringText ? 1.2 : 4}
        opacity={ringText ? 0.35 : 1}
      />

      {ringText ? (
        <>
          <defs>
            <path
              id="brand-mark-ring"
              fill="none"
              d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
            />
          </defs>
          <text
            className="text-[7.4px] font-bold tracking-[0.14em]"
            fill="currentColor"
            opacity="0.65"
          >
            <textPath href="#brand-mark-ring" startOffset="0">
              {RING_TEXT}
            </textPath>
          </text>
        </>
      ) : null}

      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        className={`font-extrabold ${
          ringText ? "text-[19px] tracking-[0.06em]" : "text-[34px] tracking-[0.02em]"
        } ${monogramClass}`}
      >
        {MONOGRAM}
      </text>
    </svg>
  );
}
