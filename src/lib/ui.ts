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

// Cartão de destaque: capa esmaecida ao fundo, gradiente puxando pra esquerda
// e conteúdo ancorado embaixo. Usado no destaque do /explorar e no "continue de
// onde parou" da home — os dois devem continuar idênticos, então mexer aqui
// muda os dois.
export const featureCard =
  "relative overflow-hidden rounded-2xl border border-white/8";
export const featureBg =
  "absolute inset-0 bg-[radial-gradient(120%_120%_at_85%_0%,rgba(158,34,76,0.4),transparent_60%),linear-gradient(135deg,#2a1a22,#141018)]";
export const featureImg =
  "absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-40";
export const featureScrim =
  "absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg)_6%,rgba(11,11,15,0.35)_55%,transparent_85%)]";
// min-h em vez de aspect-ratio: o "continue de onde parou" carrega meta, dois
// botões e a barra de progresso, e estourava o cartão em telas estreitas.
export const featureContent =
  "relative flex min-h-[clamp(300px,32vw,470px)] max-w-[520px] flex-col justify-end p-[clamp(20px,4vw,44px)]";
export const featureKicker =
  "mb-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-accent-2";
export const featureTitle =
  "text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-[1.05]";
export const featureMeta = "mt-2.5 text-[0.85rem] text-text-faint";
export const featureActions = "mt-4 flex flex-wrap gap-3";

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
