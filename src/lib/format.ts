// Helpers de apresentação compartilhados pela UI.

export function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
  return `${m} min`;
}

// Thumbnail pública do YouTube — só pra dar cara de catálogo enquanto não há
// thumbnails próprias. Provedores sem URL previsível caem no fallback do card.
export function youtubeThumb(videoExternalId: string): string {
  return `https://img.youtube.com/vi/${videoExternalId}/hqdefault.jpg`;
}

// "1 módulo" / "3 módulos"
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

export function courseMeta(moduleCount: number, lessonCount: number): string {
  return `${plural(moduleCount, "módulo")} · ${plural(lessonCount, "aula")}`;
}
