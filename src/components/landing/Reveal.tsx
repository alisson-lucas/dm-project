"use client";

import { useLayoutEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap } from "@/lib/gsap";

// Entrada por scroll: o bloco sobe e aparece quando chega na dobra.
//
// O estado inicial (invisível) vem do CSS, não do JavaScript — ver a regra de
// [data-reveal] em globals.css. Se ele nascesse visível, o visitante veria o
// conteúdo por uma fração de segundo e ele "pularia" pra posição inicial na
// hora que o GSAP assumisse, depois da hidratação.
//
// Quem pediu menos movimento no sistema nunca casa com a media query dessa
// regra nem com o matchMedia daqui: recebe a página inteira parada e à vista.

const FROM = {
  up: { y: 34 },
  left: { x: -44 },
  right: { x: 44 },
  scale: { scale: 0.95 },
} as const;

export function Reveal({
  children,
  as = "div",
  className = "",
  from = "up",
  stagger = false,
  delay = 0,
  start = "top 84%",
}: {
  children: ReactNode;
  /** tag do wrapper — ele existe no DOM, então às vezes precisa ser <ul>, <li>… */
  as?: ElementType;
  className?: string;
  /** direção de onde o bloco entra */
  from?: keyof typeof FROM;
  /** anima os filhos diretos em cascata, em vez do bloco inteiro de uma vez */
  stagger?: boolean;
  delay?: number;
  /** posição do gatilho, na sintaxe do ScrollTrigger */
  start?: string;
}) {
  const Tag = as;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // No modo cascata quem some é cada filho; o wrapper (que o CSS escondeu)
      // volta na hora, senão ele levaria os filhos junto.
      const targets = stagger ? Array.from(el.children) : [el];
      if (stagger) gsap.set(el, { opacity: 1 });

      gsap.fromTo(
        targets,
        { opacity: 0, ...FROM[from] },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          delay,
          stagger: stagger ? 0.11 : 0,
          // devolve o transform pro CSS no fim: sem isso o inline do GSAP
          // ganharia de qualquer hover/translate das classes.
          clearProps: "transform",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    });

    return () => mm.revert();
  }, [from, stagger, delay, start]);

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
