"use client";

import { useState } from "react";

// Vídeo de apresentação na tela do curso.
//
// Entra como FACHADA, não como iframe direto: quem abre a tela do curso muitas
// vezes só quer ver a lista de aulas, e carregar o player de terceiro no
// primeiro paint custa ~1MB de JavaScript que ninguém pediu. A tela da AULA
// monta o iframe de cara porque ali a pessoa foi assistir mesmo.
//
// O pôster é a antiga capa do curso: ela não sumiu, virou o primeiro quadro.
export function CourseIntro({
  embedUrl,
  poster,
  title,
}: {
  /** URL já resolvida pelo servidor — o provedor nunca chega ao cliente */
  embedUrl: string;
  poster: string | null;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(135deg,#2a1a22,#141018)]">
      {playing ? (
        <iframe
          // autoplay só aqui, no clique: é a ação que a pessoa acabou de pedir
          src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Assistir à apresentação de ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_22%] opacity-70 transition-opacity duration-300 group-hover:opacity-90"
            />
          ) : null}

          {/* escurece o pé pra legenda ficar legível sobre qualquer capa */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,15,0.85),transparent_55%)]"
          />

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-accent shadow-[0_10px_34px_-8px_rgba(158,34,76,0.9)] transition-transform duration-300 group-hover:scale-105">
              <span
                aria-hidden
                className="ml-[3px] border-y-[11px] border-l-[17px] border-y-transparent border-l-white"
              />
            </span>
          </span>

          <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 pb-3.5 text-left">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white">
              Apresentação do curso
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
