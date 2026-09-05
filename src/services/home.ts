import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { courseCover } from "../lib/covers";
import { formatDuration } from "../lib/format";
import { getCatalog, type CatalogCourse } from "./catalog";

// Dados da tela inicial. Tudo derivado do ponteiro `Enrollment.lastLessonId`
// (gravado pela página da aula) — não existe progresso por segundo assistido.

// Dentro de um curso matriculado nada é bloqueado de fato, então só há três
// estados honestos: já passou, é a atual, ainda vem.
export type TrailStatus = "done" | "current" | "next";

export interface TrailModule {
  id: string;
  title: string;
  lessonCount: number;
  durationLabel: string | null;
  status: TrailStatus;
}

export interface ContinueWatching {
  courseSlug: string;
  courseTitle: string;
  courseCategory: string | null;
  coverImageUrl: string | null;
  lessonId: string;
  lessonTitle: string;
  lessonDurationLabel: string | null;
  lessonNumber: number;
  lessonTotal: number;
  /** aulas concluídas / total, em % inteiros */
  percent: number;
  /** true quando o aluno ainda não abriu nenhuma aula deste curso */
  fresh: boolean;
  modules: TrailModule[];
}

async function getContinueWatching(
  userId: string
): Promise<ContinueWatching | null> {
  // Matrícula ativa mais recentemente assistida; quem nunca foi aberto
  // (lastWatchedAt null) fica no fim da fila.
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: EnrollmentStatus.ACTIVE },
    orderBy: [
      { lastWatchedAt: { sort: "desc", nulls: "last" } },
      { grantedAt: "desc" },
    ],
    select: { courseId: true, lastLessonId: true },
  });

  if (!enrollment) return null;

  const course = await prisma.course.findUnique({
    where: { id: enrollment.courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) return null;

  const flat = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ lesson: l, moduleId: m.id }))
  );
  if (flat.length === 0) return null;

  // Se a última aula vista foi removida (ou nunca houve), recomeça da primeira.
  const found = enrollment.lastLessonId
    ? flat.findIndex((f) => f.lesson.id === enrollment.lastLessonId)
    : -1;
  const index = found >= 0 ? found : 0;
  const { lesson, moduleId } = flat[index];

  const currentModuleIndex = course.modules.findIndex((m) => m.id === moduleId);

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    courseCategory: course.category,
    coverImageUrl: courseCover(course.coverImageUrl),
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonDurationLabel: formatDuration(lesson.durationSeconds),
    lessonNumber: index + 1,
    lessonTotal: flat.length,
    percent: Math.round((index / flat.length) * 100),
    fresh: found < 0,
    modules: course.modules.map((m, i) => ({
      id: m.id,
      title: m.title,
      lessonCount: m.lessons.length,
      durationLabel: formatDuration(
        m.lessons.reduce((n, l) => n + (l.durationSeconds ?? 0), 0)
      ),
      status:
        i < currentModuleIndex
          ? "done"
          : i === currentModuleIndex
            ? "current"
            : "next",
    })),
  };
}

export interface CategoryRow {
  category: string;
  title: string;
  items: CatalogCourse[];
}

export async function getHome(userId: string) {
  const [{ all }, continueWatching] = await Promise.all([
    getCatalog(userId),
    getContinueWatching(userId),
  ]);

  // "Recomendado para você": o que o aluno ainda não tem. Se já tem tudo,
  // mostra o catálogo inteiro em vez de uma fileira vazia.
  const notEnrolled = all.filter((c) => !c.enrolled);
  const recommended = (notEnrolled.length ? notEnrolled : all).slice(0, 8);

  const heroCategory = continueWatching?.courseCategory ?? null;
  const categories = [
    ...new Set(all.map((c) => c.category).filter((c): c is string => !!c)),
  ].sort((a, b) => {
    // o estilo do curso em andamento abre a lista
    if (a === heroCategory) return -1;
    if (b === heroCategory) return 1;
    return a.localeCompare(b, "pt-BR");
  });

  const categoryRows: CategoryRow[] = categories.map((category) => ({
    category,
    title:
      category === heroCategory
        ? `Populares em ${category}`
        : `Continue explorando ${category}`,
    items: all.filter((c) => c.category === category),
  }));

  return { all, continueWatching, recommended, categoryRows };
}
