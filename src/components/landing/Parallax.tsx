"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap } from "@/lib/gsap";

// Deslocamento preso ao scroll — o bloco anda mais (ou menos) que a página.
//
// Anima yPercent, não y: as classes de posição do Tailwind v4 usam a
// propriedade `translate`, que é composta ANTES do `transform` que o GSAP
// escreve. As duas convivem, e o deslocamento acompanha o tamanho do elemento
// em vez de ser um número fixo de pixels que só serve num breakpoint.
export function Parallax({
  children,
  className = "",
  distance = 14,
  hidden = false,
}: {
  children: ReactNode;
  className?: string;
  /** quanto o bloco sobe, em % da própria altura, ao longo do scroll */
  distance?: number;
  /** marca o bloco como decorativo (aria-hidden) */
  hidden?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { yPercent: distance / 2 },
        {
          yPercent: -distance / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    });

    return () => mm.revert();
  }, [distance]);

  return (
    <div ref={ref} className={className} aria-hidden={hidden || undefined}>
      {children}
    </div>
  );
}
