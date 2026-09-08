"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// Número que conta até o valor quando entra na tela.
//
// O valor chega como string já formatada ("+30", "1000", "12") porque é assim
// que ele vive em lib/landing.ts e no catálogo. Só anima quando dá pra separar
// UM bloco de dígitos com texto sem número em volta; "8h 30min" (duração do
// catálogo) cai fora e é renderizado parado, que é melhor do que contar a
// hora e deixar os minutos congelados.
const PARTS = /^(\D*)(\d+)(\D*)$/;

export function CountUp({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parts = PARTS.exec(value);
    if (!el || !parts) return;

    const [, prefix, digits, suffix] = parts;
    const target = Number(digits);
    const counter = { n: 0 };

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        counter,
        { n: 0 },
        {
          n: target,
          duration: 1.5,
          ease: "power2.out",
          snap: { n: 1 },
          // sem isso o GSAP zeraria o contador já na criação do tween, e o
          // número ficaria em "0" no HTML até alguém rolar até ele
          immediateRender: false,
          onUpdate: () => {
            el.textContent = `${prefix}${counter.n}${suffix}`;
          },
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );

      // se o bloco sair da tela no meio da contagem, o valor final fica
      return () => {
        el.textContent = value;
      };
    });

    return () => mm.revert();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
