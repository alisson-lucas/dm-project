import type { VideoProvider } from "@prisma/client";

export interface VideoEmbed {
  provider: VideoProvider;
  embedUrl: string;
}

// Qualquer coisa que guarde um vídeo no mesmo par provedor+id: uma aula, ou o
// vídeo de apresentação de um curso. Antes isso era Pick<Lesson, ...>, o que
// dava a entender que só aula tinha vídeo.
export interface VideoSource {
  videoProvider: VideoProvider;
  videoExternalId: string;
}

// Único lugar do código que sabe montar a URL de embed de cada provedor.
// Trocar de provedor numa aula é só mudar videoProvider/videoExternalId no
// banco — nada aqui nem no restante da API precisa mudar.
export function getVideoEmbed(video: VideoSource): VideoEmbed {
  switch (video.videoProvider) {
    case "YOUTUBE":
      // youtube-nocookie.com = modo de privacidade avançada; rel=0 evita sugestões de outros canais
      return {
        provider: "YOUTUBE",
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoExternalId}?rel=0`,
      };
    case "VIMEO":
      return {
        provider: "VIMEO",
        embedUrl: `https://player.vimeo.com/video/${video.videoExternalId}`,
      };
    case "PANDA":
      // troque "player-vz-XXXX" pelo subdomínio real da conta Panda do professor
      return {
        provider: "PANDA",
        embedUrl: `https://player-vz-XXXX.tv.pandavideo.com.br/embed/?v=${video.videoExternalId}`,
      };
    default: {
      const exhaustiveCheck: never = video.videoProvider;
      throw new Error(`Provedor de vídeo desconhecido: ${exhaustiveCheck}`);
    }
  }
}

// O vídeo de apresentação é opcional: um curso só tem embed quando as DUAS
// colunas estão preenchidas. Meio preenchido (provedor sem id, ou o contrário)
// é dado quebrado e vira null — a tela cai na capa em vez de montar uma URL
// pela metade.
export function getIntroEmbed(course: {
  introVideoProvider: VideoProvider | null;
  introVideoExternalId: string | null;
}): VideoEmbed | null {
  if (!course.introVideoProvider || !course.introVideoExternalId) return null;
  return getVideoEmbed({
    videoProvider: course.introVideoProvider,
    videoExternalId: course.introVideoExternalId,
  });
}
