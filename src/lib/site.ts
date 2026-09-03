// Plataforma de UM professor só. Tudo que é identidade da marca/do professor
// vive aqui — não no banco — porque é a mesma coisa em todo curso e toda tela.
//
// Trocar por dados reais é editar este arquivo e fazer deploy.

export const SITE_NAME = "DM PROJECT";

export const TEACHER = {
  // Grafia do nome oficial do canal (youtube.com/@dinho09ish). Ele também
  // assina "Dinho Mosca" em alguns vídeos — aqui usamos a do canal.
  name: "Dinho Moska",
  // linha curta que aparece embaixo do nome na ficha do curso
  headline: "improvisação, modos gregos e pentatônica",
  // TODO: colocar a foto do professor. Com null a UI cai no círculo com as
  // iniciais, então isso não bloqueia nada.
  avatarUrl: null as string | null,
};

// "Dinho Moska" -> "DM" (fallback do avatar)
export const teacherInitials = TEACHER.name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();
