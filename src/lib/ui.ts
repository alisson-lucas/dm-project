// Strings de classes Tailwind reaproveitadas em vários componentes.

const btnBase =
  "inline-flex items-center gap-2 font-semibold text-[0.92rem] px-5 py-2.5 rounded-md " +
  "border border-transparent cursor-pointer transition active:translate-y-px " +
  "disabled:opacity-60 disabled:cursor-default";

export const btnPrimary =
  `${btnBase} bg-accent text-white shadow-[0_8px_24px_-10px_rgba(158,34,76,0.45)] ` +
  "[&:not(:disabled):hover]:bg-accent-2";

export const btnGhost =
  `${btnBase} bg-white/10 text-text border-white/8 ` +
  "[&:not(:disabled):hover]:bg-white/18";

// Fundo do hero: gradiente radial + vertical, com um scrim no ::after.
export const heroBg =
  "absolute inset-0 bg-cover bg-[center_20%] " +
  "bg-[radial-gradient(120%_80%_at_80%_0%,rgba(158,34,76,0.4),transparent_60%),linear-gradient(180deg,#1a1016,#0b0b0f)] " +
  "after:content-[''] after:absolute after:inset-0 " +
  "after:bg-[linear-gradient(180deg,rgba(11,11,15,0.15)_0%,rgba(11,11,15,0.6)_68%,#0b0b0f_100%),linear-gradient(90deg,rgba(11,11,15,0.88)_0%,rgba(11,11,15,0.35)_45%,transparent_78%)]";

export const heroKicker =
  "mb-2.5 text-[0.78rem] tracking-[0.16em] uppercase text-accent-2 font-bold";
export const heroTitle =
  "mb-3.5 text-[clamp(2rem,5.5vw,3.6rem)] font-extrabold leading-[1.05] max-w-[16ch]";
export const heroMeta = "mb-5.5 text-[0.85rem] text-text-faint";
export const heroContent =
  "relative z-2 w-full max-w-page mx-auto px-[clamp(16px,4vw,48px)]";
export const heroActions = "flex gap-3 flex-wrap";

// Wrapper padrão de largura das seções.
export const rowWrap =
  "w-full max-w-page mx-auto px-[clamp(16px,4vw,48px)]";

// Fileira com rolagem horizontal + scrollbar discreta (usada nos carrosséis
// de aulas, cursos e módulos).
export const scroller =
  "flex gap-3 overflow-x-auto pb-2.5 snap-x snap-proximity scrollbar-thin " +
  "[scrollbar-color:rgba(255,255,255,0.14)_transparent] " +
  "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded " +
  "[&::-webkit-scrollbar-thumb]:bg-white/12 [&::-webkit-scrollbar-track]:bg-transparent";

export const sectionTitle =
  "text-[clamp(1.05rem,2vw,1.3rem)] font-bold tracking-[-0.005em]";

export const backLink =
  "inline-flex items-center gap-1.5 text-text-dim text-[0.85rem] mb-4 hover:text-text";

export const deniedWrap =
  "max-w-[560px] mx-auto py-[calc(4rem+88px)] px-6 text-center";
