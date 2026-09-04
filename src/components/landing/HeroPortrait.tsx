import Image from "next/image";

// Retrato do professor sobre o círculo, como na referência.
//
// `cutout` vem da extensão do arquivo (ver services/landing.ts):
// - true  (png/webp, fundo transparente): a foto fica POR CIMA do círculo e
//   pode estourar a borda — é o efeito do print.
// - false (jpg): não dá pra sobrepor sem ficar um retângulo colado no círculo,
//   então viramos um bloco arredondado e o círculo fica só de fundo, atrás.
export function HeroPortrait({
  src,
  cutout,
  alt,
}: {
  src: string;
  cutout: boolean;
  alt: string;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* brilho difuso atrás de tudo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(158,34,76,0.35),transparent_65%)] blur-2xl"
      />

      {/* O círculo só faz sentido com o recorte por cima dele. Com foto
          retangular ele ficaria escondido atrás do bloco, aparecendo só nos
          cantos — pior que não ter. */}
      {cutout ? (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--color-accent-2)"
            strokeWidth="1.1"
          />
        </svg>
      ) : null}

      {cutout ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 45vw"
          // object-bottom + scale deixa a figura "saindo" do círculo por
          // baixo, como no print, sem cortar a cabeça. A máscara evita que a
          // base do recorte termine num corte reto duro boiando no escuro.
          className="scale-[1.12] object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_88%,transparent_100%)]"
        />
      ) : (
        <div className="absolute inset-[9%] overflow-hidden rounded-2xl border border-white/8">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
