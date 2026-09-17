"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// Número que conta até o valor quando entra na tela.
//
// O valor chega como string já formatada ("+35", "+2.000", "12") porque é
// assim que ele vive em lib/landing.ts e no catálogo. Só anima quando dá pra
// separar UM bloco numérico com texto sem número em volta; "8h 30min" (duração
// do catálogo) cai fora e é renderizado parado, que é melhor do que contar a
// hora e deixar os minutos congelados.
const PARTS = /^(\D*)([\d.]+)(\D*)$/;

// O ponto só vale como separador de milhar quando separa grupos de exatamente
// três dígitos: "2.000" conta até dois mil, mas "1.5" não vira 15 — fica
// parado, porque ali o ponto é decimal e somar dígitos mudaria o valor.
const INTEIRO = /^\d{1,3}(?:\.\d{3})*$|^\d+$/;

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

    const [, prefix, bruto, suffix] = parts;
    if (!INTEIRO.test(bruto)) return;

    // se o professor escreveu com ponto, a contagem também anda com ponto
    const agrupado = bruto.includes(".");
    const target = Number(bruto.replace(/\./g, ""));
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
            const n = agrupado
              ? counter.n.toLocaleString("pt-BR")
              : String(counter.n);
            el.textContent = `${prefix}${n}${suffix}`;
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
