import type { LandingData } from "../../services/landing";
import { HERO, OFFER } from "../../lib/landing";
import { SITE_NAME } from "../../lib/site";
import { Logo } from "../Logo";
import { plural } from "../../lib/format";
import { Cta } from "./Cta";
import { OfferSeal } from "./OfferSeal";

// Seção de investimento no estilo da referência: card de duas colunas com o
// checklist à esquerda e o preço em tipografia composta à direita, sobre fitas
// diagonais.
//
// DUAS COISAS DA REFERÊNCIA FICARAM DE FORA, de propósito:
// - "Apenas 18 vagas disponíveis": curso gravado não tem vaga limitada.
//   Inventar escassez é urgência falsa.
// - "Dia 02 e 03 de Agosto · Espaço MBC": aquilo é evento presencial. No lugar
//   entram os fatos reais do produto (online, acesso imediato).

function Check() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 text-white"
        aria-hidden
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 5" />
      </svg>
    </span>
  );
}

function Lock() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-3.5 w-3.5 flex-none text-accent"
      aria-hidden
    >
      <rect x="3" y="7" width="10" height="7" rx="1.6" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

// As fitas diagonais do fundo. Estáticas: a página já tem a fita rolante do
// hero e o carrossel girando — mais movimento aqui só cansaria.
function Ribbon({
  items,
  className,
}: {
  items: string[];
  className: string;
}) {
  const line = Array.from({ length: 6 }).flatMap(() => items);
  return (
    <div
      aria-hidden
      className={`absolute left-[-12%] w-[124%] py-2.5 ${className}`}
    >
      <div className="flex gap-8 overflow-hidden whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-[0.18em]">
        {line.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8">
            {item}
            <span className="opacity-40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Offer({ totals }: { totals: LandingData["totals"] }) {
  // as três primeiras linhas do checklist saem do catálogo real
  const checklist = [
    totals.courses > 0 ? `${plural(totals.courses, "curso")} completos` : null,
    totals.lessons > 0 ? `${plural(totals.lessons, "aula")} em vídeo` : null,
    totals.durationLabel ? `${totals.durationLabel} de conteúdo` : null,
    ...OFFER.includes,
  ].filter((item): item is string => Boolean(item));

  const { prefix, amount, cents, alternative } = OFFER.price;

  return (
    <section className="relative isolate overflow-hidden py-[clamp(56px,8vw,110px)]">
      {/* fitas diagonais atrás do card */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-[30%] -rotate-3">
          <Ribbon
            items={["Acesso imediato", "100% online", "No seu ritmo"]}
            className="bg-accent-deep text-cream/75"
          />
        </div>
        <div className="absolute inset-x-0 top-[46%] rotate-2">
          <Ribbon
            items={[`${OFFER.guaranteeDays} dias de garantia`, SITE_NAME]}
            className="bg-white/[0.06] text-text-dim"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1040px] px-[clamp(16px,4vw,48px)]">
        <div className="relative">
          <OfferSeal />

          <div className="grid overflow-hidden rounded-2xl shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] lg:grid-cols-[1.05fr_0.95fr]">
            {/* ---- coluna esquerda: o que está incluso ---- */}
            <div className="bg-cream-2 px-[clamp(24px,4vw,44px)] pb-[clamp(32px,4vw,48px)] pt-[clamp(56px,6vw,64px)]">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-accent">
                // Investimento
              </p>
              <h2 className="mt-3 text-[clamp(1.6rem,3.4vw,2.1rem)] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink">
                Comece hoje a improvisar
              </h2>

              <ul className="mt-7 flex flex-col gap-3.5">
                {checklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[0.92rem] leading-[1.45] text-ink/85"
                  >
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- coluna direita: preço e compra ---- */}
            <div className="flex flex-col bg-cream px-[clamp(24px,4vw,40px)] pb-[clamp(28px,4vw,40px)] pt-[clamp(32px,4vw,44px)] text-center">
              <Logo
                className="justify-center text-accent"
                markClassName="h-9 w-9"
                textClassName="text-[0.95rem]"
              />

              <div className="mt-8 flex items-center justify-center gap-2.5 text-accent">
                <span className="flex flex-col items-end leading-none">
                  {prefix ? (
                    <span className="mb-1 text-[0.95rem] font-medium">
                      {prefix}
                    </span>
                  ) : null}
                  <span className="text-[1.5rem] font-bold">R$</span>
                </span>

                <span className="text-[clamp(3.6rem,10vw,5rem)] font-extrabold leading-[0.82] tracking-[-0.045em]">
                  {amount}
                </span>

                {cents ? (
                  <span className="self-end pb-1.5 text-[1.5rem] font-bold">
                    {cents}
                  </span>
                ) : null}
              </div>

              {alternative ? (
                <p className="mx-auto mt-5 w-fit rounded-full border border-dashed border-accent/40 px-5 py-2 text-[0.85rem] text-ink/75">
                  {alternative}
                </p>
              ) : null}

              <Cta
                className="mt-8"
                label="Garantir meu acesso"
                full
                note
                variant="on-light"
              />

              <p className="mt-6 flex items-center justify-center gap-2 text-[0.82rem] text-ink/70">
                <Lock />
                <span>
                  <strong className="font-semibold text-ink">
                    {OFFER.guaranteeDays} dias de garantia
                  </strong>{" "}
                  — se não for pra você, é só pedir reembolso
                </span>
              </p>

              <div className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-6 text-[0.76rem] text-ink/55">
                {HERO.facts.map((fact) => (
                  <span key={fact} className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-accent/60"
                    />
                    {fact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
