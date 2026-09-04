"use client";

import { useState } from "react";

// A landing recebe tráfego de anúncio, então ela não pode carregar o player do
// YouTube no primeiro paint (é ~1MB de JS de terceiro). Mostramos a thumbnail
// e só trocamos pelo iframe quando a pessoa clica.
export function VideoFacade({
  videoId,
  title,
  className = "",
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-xl border border-white/8 bg-black ${className}`}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproduzir: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent shadow-[0_8px_30px_-8px_rgba(158,34,76,0.8)] transition-transform group-hover:scale-105">
              <span className="ml-1 border-y-[11px] border-l-[17px] border-y-transparent border-l-white" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
