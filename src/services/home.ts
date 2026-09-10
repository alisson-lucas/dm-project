import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { courseCover } from "../lib/covers";
import { formatDuration } from "../lib/format";
import { getCatalog, getMyCourses } from "./catalog";

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

export async function getHome(userId: string) {
  // `myCourses` vem de getMyCourses (e não de filtrar o catálogo) porque a
  // ordem importa: o assistido mais recentemente primeiro.
  const [myCourses, { all }, continueWatching] = await Promise.all([
    getMyCourses(userId),
    getCatalog(userId),
    getContinueWatching(userId),
  ]);

  // Recomendados = o que o aluno ainda não tem. Abrem a fileira os do mesmo
  // estilo do curso em andamento; o clique cai na tela de apresentação, que
  // mostra o botão de comprar. `sort` é estável, então dentro de cada grupo a
  // ordem do catálogo é preservada.
  const heroCategory = continueWatching?.courseCategory ?? null;
  const recommended = all
    .filter((c) => !c.enrolled)
    .sort(
      (a, b) =>
        Number(a.category !== heroCategory) -
        Number(b.category !== heroCategory)
    )
    .slice(0, 8);

  return { myCourses, recommended, continueWatching };
}
