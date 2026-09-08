import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

// Figura do professor no hero, no estilo da referência: recorte sobre um halo
// de cor chapada que se dissolve nas bordas. Sem círculo — aquilo era da
// referência anterior.
//
// `cutout` vem da extensão do arquivo (ver services/landing.ts):
// - true  (png/webp, fundo transparente): a figura fica solta sobre o halo,
//   que é o efeito do print.
// - false (jpg): não dá pra soltar um retângulo sobre o halo sem ficar colado,
//   então viramos um bloco arredondado e o halo fica só de brilho atrás.
export function HeroPortrait({
  src,
  cutout,
  alt,
  className = "",
  ...rest
}: {
  src: string;
  cutout: boolean;
  alt: string;
  /** o tamanho e o posicionamento vêm de quem usa */
  className?: string;
  // o resto (na prática, o data-hero que a animação do hero procura) vai
  // direto pra raiz — é ela que o GSAP move, não a imagem
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div className={`relative ${className}`} {...rest}>
      {/* Halo: chapado no miolo e dissolvendo pra fora. É o meio-termo entre o
          bloco de cor sólida da referência e o fundo escuro do resto da página. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[4%] h-[88%] w-[min(112%,680px)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent)_0%,var(--color-accent)_46%,rgba(158,34,76,0.58)_72%,rgba(158,34,76,0.12)_90%,transparent_100%)]"
      />

      {cutout ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 78vw, 620px"
          // object-bottom mantém a figura apoiada na base; a máscara evita que
          // o recorte termine num corte reto duro boiando no escuro.
          className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_88%,transparent_100%)]"
        />
      ) : (
        <div className="absolute inset-x-[10%] bottom-0 top-[8%] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 78vw, 620px"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
