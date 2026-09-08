"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";

// Coreografia de entrada do hero. Recebe o conteúdo já montado no servidor e
// procura os alvos por [data-hero]: assim a página continua sendo um Server
// Component e só esta casca vai pro bundle do cliente.
//
// A ordem é a da leitura: a figura chega, os textos laterais aparecem, a
// headline gigante entra letra por letra e os botões fecham. Depois disso a
// figura ganha um parallax leve, preso ao scroll do próprio hero.
//
// CUSTO: os alvos nascem invisíveis no CSS (ver [data-hero] em globals.css),
// então a headline — que é a maior candidata a LCP da página — só pinta
// depois da hidratação. Por isso a linha do tempo é curta e não espera nada:
// começa no primeiro frame em que o React assume.

export function HeroStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    // o escopo faz os seletores de texto abaixo valerem só dentro do hero
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const title = root.querySelector<HTMLElement>('[data-hero="title"]');

      // aria: "auto" põe o texto original num aria-label e tira os pedaços da
      // árvore de acessibilidade — o leitor de tela continua lendo a frase
      // inteira, não vinte letras soltas.
      const split = title
        ? SplitText.create(title, { type: "chars", aria: "auto" })
        : null;

      // Revela todo mundo ANTES de montar a linha do tempo. Os .from() abaixo
      // gravam o estado inicial na hora em que são criados e o seguram até a
      // vez deles chegar; se este set morasse dentro da linha do tempo, ele
      // rodaria no tempo 0 e acenderia os blocos que ainda não entraram.
      gsap.set(root.querySelectorAll("[data-hero]"), { opacity: 1 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // A figura entra só por opacidade e escala: o deslocamento vertical dela
      // é do parallax lá embaixo, e duas animações disputando o mesmo yPercent
      // dariam tranco se alguém rolasse a página no meio da entrada.
      tl.from('[data-hero="figure"]', {
        opacity: 0,
        scale: 0.93,
        duration: 1.15,
      })
        .from(
          '[data-hero="side"]',
          { opacity: 0, y: 26, duration: 0.8, stagger: 0.14 },
          0.15,
        );

      if (split) {
        tl.from(
          split.chars,
          {
            opacity: 0,
            yPercent: 55,
            rotateX: -55,
            transformPerspective: 500,
            duration: 0.7,
            stagger: 0.026,
          },
          0.32,
        );
      }

      tl.from(
        '[data-hero="actions"] > *',
        { opacity: 0, y: 18, duration: 0.6, stagger: 0.1 },
        "-=0.35",
      ).from(
        '[data-hero="stats"]',
        { opacity: 0, y: 18, duration: 0.6 },
        "<0.08",
      );

      // Parallax da figura: ela sobe um pouco mais devagar que o resto
      // enquanto o hero sai de cena. yPercent (e não y) porque a figura muda
      // de tamanho entre os breakpoints.
      const figure = root.querySelector<HTMLElement>('[data-hero="figure"]');
      if (figure) {
        gsap.fromTo(
          figure,
          { yPercent: 0 },
          {
            yPercent: -11,
            ease: "none",
            // sem isso o tween aplicaria o estado inicial na criação, no meio
            // da entrada da figura
            immediateRender: false,
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      }

      // devolve a headline inteira ao DOM quando o componente sai
      return () => split?.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
