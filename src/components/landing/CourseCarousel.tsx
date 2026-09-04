"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LandingCourse } from "@/services/landing";
import { plural } from "@/lib/format";

// Carrossel horizontal de cards retrato, no estilo da referência: a imagem
// ocupa o card inteiro, o título vem em caixa alta sobre um gradiente escuro no
// rodapé, e a fita rola sangrando pelas bordas da tela.
//
// LOOP INFINITO: a lista é renderizada 3x e o scroll começa na cópia do meio.
// Quando passa do fim da cópia 3 (ou volta antes da cópia 1), a gente reposiciona
// o scroll em ±1 cópia. Como o conteúdo é idêntico, o salto é invisível.
// Ele acontece só depois que o scroll para, senão cortaria a animação no meio.
//
// AUTOPLAY: anda um card por vez. Pausa no hover, no foco, no toque e com a aba
// em segundo plano, e não roda pra quem pediu menos movimento no sistema.

const AUTOPLAY_MS = 3800;
const SETTLE_MS = 140;
const COPIES = 3;

export function CourseCarousel({
  courses,
  fallbackCover,
}: {
  courses: LandingCourse[];
  /** capa padrão pros cursos que não têm arte própria no banco */
  fallbackCover: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | null>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // largura de UMA cópia da lista, medida pelo próprio layout (inclui o gap)
  const copyWidth = useCallback(() => {
    const el = ref.current;
    if (!el) return 0;
    const first = el.children[0] as HTMLElement | undefined;
    const nextCopy = el.children[courses.length] as HTMLElement | undefined;
    if (!first || !nextCopy) return 0;
    return nextCopy.offsetLeft - first.offsetLeft;
  }, [courses.length]);

  // distância de um card pro próximo (largura + gap)
  const stride = useCallback(() => {
    const el = ref.current;
    if (!el) return 0;
    const a = el.children[0] as HTMLElement | undefined;
    const b = el.children[1] as HTMLElement | undefined;
    return a && b ? b.offsetLeft - a.offsetLeft : 0;
  }, []);

  // reposiciona sem animar e sem deixar o snap brigar com o salto
  const shift = useCallback((delta: number) => {
    const el = ref.current;
    if (!el) return;
    const previous = el.style.scrollSnapType;
    el.style.scrollSnapType = "none";
    el.scrollLeft += delta;
    requestAnimationFrame(() => {
      el.style.scrollSnapType = previous;
    });
  }, []);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || el.clientWidth === 0) return;
    const cw = copyWidth();
    if (!cw) return;
    const total = Math.max(1, Math.ceil(cw / el.clientWidth));
    setPages(total);
    setPage(Math.round((el.scrollLeft % cw) / el.clientWidth) % total);
  }, [copyWidth]);

  // começa na cópia do meio pra haver conteúdo dos dois lados
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const cw = copyWidth();
      if (cw) el.scrollLeft = cw;
      measure();
    });
    return () => cancelAnimationFrame(id);
  }, [copyWidth, measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      measure();
      // o salto do loop só depois que o scroll assenta, pra não cortar a
      // rolagem suave no meio do caminho
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        const node = ref.current;
        if (!node) return;
        const cw = copyWidth();
        if (!cw) return;
        if (node.scrollLeft >= cw * (COPIES - 1)) shift(-cw);
        else if (node.scrollLeft < 1) shift(cw);
      }, SETTLE_MS);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [measure, copyWidth, shift]);

  // quem pediu menos movimento no sistema não recebe autoplay
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // aba em segundo plano não fica girando à toa
  useEffect(() => {
    const sync = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (paused || reduced || courses.length < 2) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const step = stride();
      if (step) el.scrollBy({ left: step, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, stride, courses.length]);

  function goTo(index: number) {
    const el = ref.current;
    if (!el) return;
    const cw = copyWidth();
    if (!cw) return;
    // mantém o usuário na cópia em que ele já está
    const base = Math.floor(el.scrollLeft / cw) * cw;
    el.scrollTo({ left: base + index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Cursos incluídos"
    >
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(16px,4vw,48px)] pb-3 scrollbar-thin [scrollbar-color:rgba(255,255,255,0.14)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/12 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {Array.from({ length: COPIES }).flatMap((_, copy) =>
          courses.map((course, i) => {
            // capa própria do curso (se existir no banco) tem prioridade
            const cover = course.coverImageUrl ?? fallbackCover;
            return (
            <article
              key={`${copy}-${course.slug}`}
              // só a primeira cópia existe pro leitor de tela; as outras são
              // duplicata visual e seriam lidas como cursos repetidos
              aria-hidden={copy > 0}
              className="relative aspect-[3/4] w-[clamp(232px,68vw,296px)] flex-none snap-start overflow-hidden rounded-xl border border-white/8"
            >
              {cover ? (
                // next/image e não <img>: o arquivo original tem 1,6 MB e o
                // card exibe no máximo 296px de largura. Assim ele é servido
                // em WebP/AVIF no tamanho certo. Como a URL é a mesma nos 27
                // cards, o navegador baixa uma vez só.
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(max-width: 420px) 68vw, 296px"
                  className="object-cover"
                />
              ) : (
                // Sem arte de capa, o card não pode virar um retângulo morto
                // igual ao vizinho: o brilho muda de posição por índice e o
                // estilo do curso ocupa o vazio.
                <div
                  className="absolute inset-0 bg-[radial-gradient(120%_90%_at_var(--gx)_var(--gy),rgba(158,34,76,0.45),transparent_62%),linear-gradient(160deg,#2a1a22,#121017)]"
                  style={
                    {
                      "--gx": `${20 + ((i * 27) % 62)}%`,
                      "--gy": `${8 + ((i * 19) % 34)}%`,
                    } as React.CSSProperties
                  }
                />
              )}

              {/* gradiente que garante leitura do título sobre qualquer imagem */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.93)_0%,rgba(0,0,0,0.45)_40%,transparent_74%)]"
              />

              {!course.coverImageUrl && course.category ? (
                // Com a mesma capa em todos os cards, o estilo é o que
                // diferencia um do outro — então vira chip legível, não
                // texto solto por cima da foto.
                <span className="absolute left-3 top-3 rounded bg-black/55 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white/75 backdrop-blur-sm">
                  {course.category}
                </span>
              ) : null}

              {course.levelLabel ? (
                <span className="absolute right-3 top-3 rounded bg-black/65 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm">
                  {course.levelLabel}
                </span>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-[clamp(1.1rem,4.4vw,1.4rem)] font-extrabold uppercase leading-[1.08] tracking-[-0.01em] text-white">
                  {course.title}
                </h3>
                <p className="mt-3 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/55">
                  {[plural(course.lessonCount, "aula"), course.durationLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </article>
            );
          })
        )}
      </div>

      {pages > 1 ? (
        <div className="mt-7 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para o grupo ${i + 1} de ${pages}`}
              aria-current={i === page}
              className={`h-2 cursor-pointer rounded-full transition-all ${
                i === page ? "w-7 bg-accent" : "w-2 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
