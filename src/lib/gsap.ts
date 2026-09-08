"use client";

// Ponto único de registro do GSAP. Os componentes de animação importam daqui
// em vez de "gsap" direto pra garantir que os plugins já estão registrados —
// registrar duas vezes é inofensivo, mas esquecer de registrar quebra em
// produção (o tree-shaking derruba o plugin que ninguém referenciou).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // As imagens da landing (hero, carrossel, foto do professor) entram depois
  // do primeiro cálculo e empurram a página pra baixo. Sem este refresh os
  // gatilhos ficam ancorados nas posições antigas e disparam fora de hora.
  window.addEventListener("load", () => ScrollTrigger.refresh());

  // No mobile, a barra do navegador some/aparece durante o scroll e dispara
  // um resize. Recalcular ali dá tranco na animação sem nenhum ganho.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };
