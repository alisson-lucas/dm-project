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
// Banner de abertura da área do aluno — tipografia grande e CENTRALIZADA,
// com a foto recuada ao fundo. O arranjo anterior era texto à esquerda sobre
// a imagem à direita; virou este depois que o cliente mandou a referência de
// como queria a tela inicial.
export const featureBg =
  "absolute inset-0 bg-[radial-gradient(110%_130%_at_50%_0%,rgba(158,34,76,0.55),transparent_62%),linear-gradient(160deg,#2a1a22,#111016)]";
export const featureImg =
  "absolute inset-0 h-full w-full object-cover object-[center_26%] opacity-30";
// Escurecimento radial, e não lateral: com o texto no meio, o contraste tem
// que ser mais forte JUSTO no centro — o degradê da esquerda pra direita
// deixava a headline em cima da parte clara da foto.
export const featureScrim =
  "absolute inset-0 bg-[radial-gradient(125%_105%_at_50%_45%,rgba(11,11,15,0.5),rgba(11,11,15,0.93))]";
// min-h em vez de aspect-ratio: o "continue de onde parou" carrega meta, dois
// botões e a barra de progresso, e estourava o cartão em telas estreitas.
export const featureContent =
  "relative mx-auto flex min-h-[clamp(260px,26vw,360px)] max-w-[760px] flex-col items-center justify-center px-[clamp(20px,4vw,44px)] py-[clamp(30px,4vw,48px)] text-center";
export const featureKicker =
  "mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-accent-2";
export const featureTitle =
  "max-w-[16ch] text-[clamp(1.6rem,3.6vw,2.5rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-balance [text-shadow:0_8px_34px_rgba(0,0,0,0.65)]";
export const featureMeta = "mt-3.5 text-[0.85rem] text-text-faint";
export const featureActions = "mt-6 flex flex-wrap justify-center gap-3";

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
