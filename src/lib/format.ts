// Helpers de apresentação compartilhados pela UI.

import type { CourseLevel } from "@prisma/client";

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};

export function courseLevelLabel(
  level?: CourseLevel | null
): string | null {
  return level ? LEVEL_LABELS[level] : null;
}

export function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
  return `${m} min`;
}

// Versão curta pros números grandes da ficha do curso: "3h20" / "42 min"
export function formatDurationCompact(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m} min`;
}

// Duração de aula no formato de player: "6:12" / "1:04:30"
export function formatClock(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0
    ? `${h}:${mm}:${String(s).padStart(2, "0")}`
    : `${mm}:${String(s).padStart(2, "0")}`;
}

// "1 módulo" / "3 módulos"
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

// Meta dos cards de curso: "14 aulas · 3h20". Não cita professor — a
// plataforma é de um professor só (ver src/lib/site.ts).
export function courseCardMeta(
  lessonCount: number,
  durationSeconds?: number | null
): string {
  const lessons = plural(lessonCount, "aula");
  const duration = formatDurationCompact(durationSeconds);
  return duration ? `${lessons} · ${duration}` : lessons;
}
