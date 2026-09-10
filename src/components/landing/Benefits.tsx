"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { BENEFITS } from "@/lib/landing";
import { Reveal } from "./Reveal";

// Os três argumentos da landing, cada um com um desenho do BRAÇO da guitarra.
//
// A seção era três caixas de texto: servia para curso de qualquer coisa. O que
// ela tem de mais específico — ser um curso de guitarra — não aparecia em
// lugar nenhum. Agora cada card mostra o mesmo braço em três estados
// diferentes: um sistema só, três afirmações. Tudo é SVG desenhado aqui, sem
// biblioteca de ícones e sem imagem para baixar.
//
// Os diagramas são de verdade, não decoração: o do meio é a pentatônica de Lá
// menor na 5ª casa — o primeiro desenho que todo guitarrista aprende, e o
// mesmo que a copy chama de "o primeiro desenho". As tônicas (as notas Lá)
// vêm preenchidas em carmim, que é como um professor marca no quadro.

// ---------------------------------------------------------------- geometria
// Um sistema de coordenadas só para os três desenhos, senão eles não parecem
// o mesmo braço. Ordem das cordas como na tablatura: mizinha (1) em cima,
// bordão (6) embaixo, com a espessura do traço acompanhando o calibre.
const STRINGS = [
  { y: 18, w: 0.7 },
  { y: 34, w: 0.85 },
  { y: 50, w: 1.05 },
  { y: 66, w: 1.3 },
  { y: 82, w: 1.6 },
  { y: 98, w: 1.95 },
];

const STRING_COLOR = "rgba(255,255,255,0.22)";
const FRET_COLOR = "rgba(255,255,255,0.14)";

// O corpo do braço. Sem ele os três desenhos leem como pauta de música: são
// as bordas (o filete da madeira) que dizem que aquilo é um instrumento.
// Cor chapada de propósito — gradiente em SVG exigiria um <defs> com id, e id
// repetido em três SVGs na mesma página é pedido de conflito.
function Neck() {
  return (
    <g>
      <rect x="0" y="8" width="260" height="100" rx="3" fill="rgba(255,255,255,0.03)" />
      <line x1="0" x2="260" y1="8" y2="8" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      <line x1="0" x2="260" y1="108" y2="108" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
    </g>
  );
}

function Strings() {
  return (
    <g>
      {STRINGS.map((s) => (
        <line
          key={s.y}
          x1="4"
          x2="256"
          y1={s.y}
          y2={s.y}
          stroke={STRING_COLOR}
          strokeWidth={s.w}
        />
      ))}
    </g>
  );
}

function Frets({ at }: { at: number[] }) {
  return (
    <g>
      {at.map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1="12"
          y2="104"
          stroke={FRET_COLOR}
          strokeWidth="1.2"
        />
      ))}
    </g>
  );
}

// A barra que varre o braço no hover, como se alguém tocasse a frase.
function Playhead() {
  return (
    <rect
      className="playhead"
      x="4"
      y="10"
      width="2"
      height="96"
      rx="1"
      fill="var(--color-accent-2)"
      opacity="0"
    />
  );
}

const svgProps = {
  viewBox: "0 0 260 116",
  className: "h-auto w-full",
  role: "presentation" as const,
};

// ------------------------------------------------- 1. as cinco posições
function ArtOrdem() {
  // Cinco blocos ao longo do braço: a primeira posição acesa e as outras
  // esperando a vez. É a "ordem" da copy, desenhada.
  const boxes = [6, 56, 106, 156, 206];

  return (
    <svg {...svgProps}>
      <Neck />
      <Strings />
      <Frets at={[6, 56, 106, 156, 206, 252]} />
      {boxes.map((x, i) => (
        <rect
          key={x}
          className="hot"
          x={x}
          y="11"
          width="46"
          height="94"
          rx="7"
          fill={i === 0 ? "rgba(198,44,96,0.2)" : "transparent"}
          stroke={
            i === 0 ? "var(--color-accent-2)" : `rgba(255,255,255,${0.3 - i * 0.05})`
          }
          strokeWidth={i === 0 ? 1.6 : 1.1}
        />
      ))}
      <Playhead />
    </svg>
  );
}

// --------------------------------------- 2. a pentatônica de Lá na 5ª casa
function ArtBraco() {
  // Casas 5, 6, 7 e 8. Os pontos são o desenho 1 da pentatônica menor de Lá;
  // os três marcados como tônica são as notas Lá (bordão/5ª, ré/7ª, mi/5ª).
  const FRETS = [24, 78, 132, 186, 240];
  const CENTER = [51, 105, 159, 213]; // casas 5, 6, 7 e 8

  const dots: { x: number; y: number; root?: boolean }[] = [
    // 5ª casa: as seis cordas
    ...STRINGS.map((s, i) => ({
      x: CENTER[0],
      y: s.y,
      root: i === 0 || i === 5, // mizinha e bordão na 5ª casa dão Lá
    })),
    // 7ª casa: sol, ré e lá
    { x: CENTER[2], y: STRINGS[2].y },
    { x: CENTER[2], y: STRINGS[3].y, root: true },
    { x: CENTER[2], y: STRINGS[4].y },
    // 8ª casa: mizinha, si e bordão
    { x: CENTER[3], y: STRINGS[0].y },
    { x: CENTER[3], y: STRINGS[1].y },
    { x: CENTER[3], y: STRINGS[5].y },
  ].sort((a, b) => a.x - b.x || a.y - b.y);

  return (
    <svg {...svgProps}>
      <Neck />
      <Strings />
      <Frets at={FRETS} />
      {/* marcador de casa do braço, na 7ª — o pontinho da madeira */}
      <circle cx={CENTER[2]} cy="58" r="2.4" fill="rgba(255,255,255,0.12)" />
      {dots.map((d) => (
        <circle
          key={`${d.x}-${d.y}`}
          className="hot"
          cx={d.x}
          cy={d.y}
          r="6.4"
          fill={d.root ? "var(--color-accent)" : "rgba(11,11,15,0.9)"}
          stroke={d.root ? "var(--color-accent-2)" : "rgba(255,255,255,0.6)"}
          strokeWidth="1.4"
        />
      ))}
      <Playhead />
    </svg>
  );
}

// ------------------------------------------------- 3. o sinal de repetição
function ArtRitmo() {
  // Barras de repetição em volta de um trecho: a frase volta ao início
  // quantas vezes precisar. É a notação musical, não um ícone de "refresh".
  const bar = (x: number, mirrored: boolean) => {
    const thick = mirrored ? x + 6 : x;
    const thin = mirrored ? x : x + 7.5;
    const dotsX = mirrored ? x - 7 : x + 14;
    return (
      <g key={x}>
        <rect x={thick} y="12" width="3.2" height="92" fill="rgba(255,255,255,0.34)" />
        <rect x={thin} y="12" width="1.2" height="92" fill="rgba(255,255,255,0.34)" />
        <circle cx={dotsX} cy="42" r="2.6" fill="var(--color-accent-2)" />
        <circle cx={dotsX} cy="74" r="2.6" fill="var(--color-accent-2)" />
      </g>
    );
  };

  return (
    <svg {...svgProps}>
      <Neck />
      <Strings />
      <Frets at={[86, 138, 190]} />
      {bar(30, false)}
      {bar(228, true)}
      {/* a frase entre as barras, subindo de corda em corda */}
      {[
        { x: 104, y: STRINGS[3].y },
        { x: 150, y: STRINGS[2].y },
        { x: 196, y: STRINGS[1].y },
      ].map((d) => (
        <circle
          key={`${d.x}-${d.y}`}
          className="hot"
          cx={d.x}
          cy={d.y}
          r="6.4"
          fill="rgba(11,11,15,0.9)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.4"
        />
      ))}
      <Playhead />
    </svg>
  );
}

const ART = {
  ordem: { Art: ArtOrdem, label: "As 5 posições da pentatônica" },
  braco: { Art: ArtBraco, label: "Pentatônica de Lá menor · 5ª casa" },
  ritmo: { Art: ArtRitmo, label: "Sinal de repetição" },
};

export function Benefits() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);
    const limpar: (() => void)[] = [];

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".bcard", root);

      cards.forEach((card, i) => {
        const alvos = card.querySelectorAll(".hot");
        const barra = card.querySelector(".playhead");

        // entrada: os pontos do diagrama aparecem em cascata, da esquerda pra
        // direita, depois que o card já entrou (o Reveal cuida do card)
        gsap.from(alvos, {
          opacity: 0,
          scale: 0.35,
          transformOrigin: "center",
          duration: 0.5,
          ease: "back.out(2.2)",
          stagger: 0.055,
          delay: 0.2 + i * 0.1,
          scrollTrigger: { trigger: card, start: "top 84%", once: true },
        });

        // hover: a barra varre o braço e cada ponto responde na passagem dela
        let tl: gsap.core.Timeline | null = null;
        const varrer = () => {
          if (tl) tl.kill();
          const passo = 0.9 / Math.max(alvos.length, 1);
          tl = gsap.timeline();
          tl.set(barra, { attr: { x: 4 }, opacity: 0.85 })
            .to(barra, { attr: { x: 254 }, duration: 0.9, ease: "power1.inOut" })
            .to(barra, { opacity: 0, duration: 0.22 }, "-=0.18")
            .to(
              alvos,
              {
                scale: 1.16,
                transformOrigin: "center",
                duration: 0.16,
                yoyo: true,
                repeat: 1,
                stagger: passo,
              },
              0.05,
            );
        };

        card.addEventListener("mouseenter", varrer);
        limpar.push(() => card.removeEventListener("mouseenter", varrer));
      });

      return () => {
        limpar.forEach((f) => f());
        limpar.length = 0;
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={ref}>
      <Reveal stagger className="grid gap-5 md:grid-cols-3">
        {BENEFITS.map((b) => {
          const { Art, label } = ART[b.art];
          return (
            <article
              key={b.title}
              className="bcard group overflow-hidden rounded-xl border border-white/8 bg-surface transition-colors duration-300 hover:border-accent/40"
            >
              {/* o diagrama fica embutido num painel mais fundo que o card,
                  como se estivesse encaixado nele */}
              <div className="border-b border-white/8 bg-bg px-5 pb-4 pt-5">
                <Art />
                <p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-text-faint transition-colors duration-300 group-hover:text-accent-2">
                  {label}
                </p>
              </div>

              <div className="p-6">
                <h3 className="text-[1rem] font-bold">{b.title}</h3>
                <p className="mt-2.5 text-[0.88rem] leading-[1.6] text-text-dim">
                  {b.body}
                </p>
              </div>
            </article>
          );
        })}
      </Reveal>
    </div>
  );
}
