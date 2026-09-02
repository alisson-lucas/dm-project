import type { Lesson, VideoProvider } from "@prisma/client";

export interface VideoEmbed {
  provider: VideoProvider;
  embedUrl: string;
}

// Único lugar do código que sabe montar a URL de embed de cada provedor.
// Trocar de provedor numa aula é só mudar videoProvider/videoExternalId no
// banco — nada aqui nem no restante da API precisa mudar.
export function getVideoEmbed(lesson: Pick<Lesson, "videoProvider" | "videoExternalId">): VideoEmbed {
  switch (lesson.videoProvider) {
    case "YOUTUBE":
      // youtube-nocookie.com = modo de privacidade avançada; rel=0 evita sugestões de outros canais
      return {
        provider: "YOUTUBE",
        embedUrl: `https://www.youtube-nocookie.com/embed/${lesson.videoExternalId}?rel=0`,
      };
    case "VIMEO":
      return {
        provider: "VIMEO",
        embedUrl: `https://player.vimeo.com/video/${lesson.videoExternalId}`,
      };
    case "PANDA":
      // troque "player-vz-XXXX" pelo subdomínio real da conta Panda do professor
      return {
        provider: "PANDA",
        embedUrl: `https://player-vz-XXXX.tv.pandavideo.com.br/embed/?v=${lesson.videoExternalId}`,
      };
    default: {
      const exhaustiveCheck: never = lesson.videoProvider;
      throw new Error(`Provedor de vídeo desconhecido: ${exhaustiveCheck}`);
    }
  }
}
