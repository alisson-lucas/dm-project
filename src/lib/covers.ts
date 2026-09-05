// Regra única de capa de curso, válida na landing E na área logada.
//
// As capas que vieram no seed são thumbnails do YouTube: 16:9, com texto
// embutido e a estética de vídeo gratuito. Elas derrubam o valor percebido do
// produto em qualquer tela onde apareçam, então em todo lugar que mostra curso
// a gente troca pela capa da marca.
//
// Assim que um curso ganhar arte própria no banco (qualquer URL que não seja
// do YouTube), ela passa a valer sozinha, sem mexer no código.

export const DEFAULT_COURSE_COVER = "/images/landing/curso-cover.png";

export function isPlaceholderCover(url: string | null | undefined): boolean {
  return !url || /(^|\.)(img\.)?youtube\.com|ytimg\.com/i.test(url);
}

export function courseCover(url: string | null | undefined): string {
  return isPlaceholderCover(url) ? DEFAULT_COURSE_COVER : (url as string);
}
