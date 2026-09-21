"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { btnGhost, btnPrimary } from "@/lib/ui";

// Carrossel de abertura da área do aluno.
//
// Cada slide é IMAGEM + texto por cima, e a lista vem pronta da página — é o
// arranjo da referência que o cliente mandou. Como a imagem é um campo do
// slide, trocar a foto do "bem-vindo" por um banner desenhado depois é mexer
// num caminho de arquivo, não no componente.
//
// Um slide só: ele vira banner estático, sem setas nem bolinhas. Controle que
// não controla nada é ruído.

export interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  meta?: string | null;
  /** caminho da imagem de fundo; null cai no gradiente da marca */
  image?: string | null;
  cta: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
  /** barra de progresso, usada pelo slide de "continue de onde parou" */
  percent?: number | null;
}

const INTERVALO_MS = 6500;

function Seta({ para }: { para: "anterior" | "proximo" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 ${para === "anterior" ? "rotate-180" : ""}`}
    >
      <path d="M5.5 2.5 11 8l-5.5 5.5" />
    </svg>
  );
}

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [semMovimento, setSemMovimento] = useState(false);
  const regiao = useRef<HTMLElement>(null);

  const total = slides.length;
  const varios = total > 1;

  const ir = useCallback(
    (i: number) => setAtual(((i % total) + total) % total),
    [total]
  );

  // Quem pediu menos movimento no sistema não recebe rodízio automático: um
  // banner que troca sozinho é exatamente o tipo de coisa que a preferência
  // existe pra desligar.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSemMovimento(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!varios || pausado || semMovimento) return;
    const t = setInterval(() => setAtual((i) => (i + 1) % total), INTERVALO_MS);
    return () => clearInterval(t);
  }, [varios, pausado, semMovimento, total]);

  // aba em segundo plano não precisa girar banner
  useEffect(() => {
    const sync = () => setPausado(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  if (total === 0) return null;

  return (
    <section
      ref={regiao}
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      className="relative overflow-hidden rounded-2xl border border-white/8"
    >
      <div
        className={`flex ${semMovimento ? "" : "transition-transform duration-500 ease-out"}`}
        style={{ transform: `translateX(-${atual * 100}%)` }}
      >
        {slides.map((s, i) => {
          const visivel = i === atual;

          return (
            <article
              key={s.id}
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={!visivel}
              className="relative w-full flex-none"
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(110%_130%_at_50%_0%,rgba(158,34,76,0.55),transparent_62%),linear-gradient(160deg,#2a1a22,#111016)]"
              >
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_26%] opacity-30"
                  />
                ) : null}
              </div>

              {/* escurecimento radial: com o texto no meio, o contraste tem
                  que ser mais forte justo no centro */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(125%_105%_at_50%_45%,rgba(11,11,15,0.5),rgba(11,11,15,0.93))]"
              />

              <div className="relative mx-auto flex min-h-[clamp(260px,26vw,360px)] max-w-[760px] flex-col items-center justify-center px-[clamp(20px,4vw,44px)] py-[clamp(30px,4vw,48px)] text-center">
                <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-accent-2">
                  {s.kicker}
                </p>

                <h2 className="max-w-[16ch] text-[clamp(1.6rem,3.6vw,2.5rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-balance [text-shadow:0_8px_34px_rgba(0,0,0,0.65)]">
                  {s.title}
                </h2>

                {s.meta ? (
                  <p className="mt-3.5 text-[0.85rem] text-text-faint">{s.meta}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href={s.cta.href}
                    // slide fora de vista não pode receber foco do teclado:
                    // senão o Tab "some" pra dentro de um painel invisível
                    tabIndex={visivel ? undefined : -1}
                    className={btnPrimary}
                  >
                    {s.cta.label}
                  </Link>
                  {s.secondary ? (
                    <Link
                      href={s.secondary.href}
                      tabIndex={visivel ? undefined : -1}
                      className={btnGhost}
                    >
                      {s.secondary.label}
                    </Link>
                  ) : null}
                </div>

                {typeof s.percent === "number" ? (
                  <div
                    className="mx-auto mt-7 h-[3px] w-[min(340px,100%)] overflow-hidden rounded-full bg-white/12"
                    role="progressbar"
                    aria-valuenow={s.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${s.percent}% do curso concluído`}
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {varios ? (
        <>
          <button
            type="button"
            onClick={() => ir(atual - 1)}
            aria-label="Destaque anterior"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-text backdrop-blur-sm transition-colors hover:bg-accent hover:text-white max-sm:hidden"
          >
            <Seta para="anterior" />
          </button>
          <button
            type="button"
            onClick={() => ir(atual + 1)}
            aria-label="Próximo destaque"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-text backdrop-blur-sm transition-colors hover:bg-accent hover:text-white max-sm:hidden"
          >
            <Seta para="proximo" />
          </button>

          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ir para o destaque ${i + 1}: ${s.title}`}
                aria-current={i === atual}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === atual
                    ? "w-7 bg-accent-2"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
