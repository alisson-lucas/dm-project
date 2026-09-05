import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { courseCover } from "../lib/covers";
import {
  courseLevelLabel,
  formatClock,
  formatDuration,
  formatDurationCompact,
} from "../lib/format";

// View model da página /courses/[slug]. Assim como a home, todo o progresso sai
// do ponteiro `Enrollment.lastLessonId` — não há progresso por segundo.

// Dentro de um curso matriculado nada é bloqueado, então só existem três
// estados: já passou, é a atual, ainda vem.
export type ProgressStatus = "done" | "current" | "next";

export interface CoursePageLesson {
  id: string;
  title: string;
  durationLabel: string | null; // "6:12"
  status: ProgressStatus;
}

export interface CoursePageModule {
  id: string;
  number: string; // "01"
  title: string;
  lessonCount: number;
  durationLabel: string | null; // "42 min"
  status: ProgressStatus;
  lessons: CoursePageLesson[];
}

export interface CoursePageData {
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  levelLabel: string | null;
  // Não há professor por curso: a plataforma é de um professor só, e os dados
  // dele saem de src/lib/site.ts (TEACHER) direto na página.
  stats: {
    lessonTotal: number;
    durationLabel: string | null; // "3h20"
    completedCount: number;
    moduleCount: number;
  };
  percent: number;
  /** null quando o curso ainda não tem nenhuma aula cadastrada */
  currentLesson: { id: string; number: number } | null;
  /** true quando o aluno ainda não abriu nenhuma aula deste curso */
  fresh: boolean;
  modules: CoursePageModule[];
}

export type CoursePageResult =
  | { status: "ok"; data: CoursePageData }
  | { status: "not-found" }
  | { status: "forbidden" };

export async function getCoursePageForUser(
  userId: string,
  slug: string
): Promise<CoursePageResult> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) return { status: "not-found" };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
    return { status: "forbidden" };
  }

  const flat = course.modules.flatMap((m) =>
    m.lessons.map((lesson) => ({ lesson, moduleId: m.id }))
  );

  // Se a última aula vista sumiu (ou nunca houve), recomeça da primeira.
  const found = enrollment.lastLessonId
    ? flat.findIndex((f) => f.lesson.id === enrollment.lastLessonId)
    : -1;
  const index = flat.length === 0 ? -1 : found >= 0 ? found : 0;

  const currentModuleIndex =
    index >= 0
      ? course.modules.findIndex((m) => m.id === flat[index].moduleId)
      : -1;

  // posição de cada aula na lista achatada, pra comparar com `index`
  let position = 0;
  const modules: CoursePageModule[] = course.modules.map((m, i) => ({
    id: m.id,
    number: String(i + 1).padStart(2, "0"),
    title: m.title,
    lessonCount: m.lessons.length,
    durationLabel: formatDuration(
      m.lessons.reduce((n, l) => n + (l.durationSeconds ?? 0), 0)
    ),
    status:
      currentModuleIndex < 0 || i > currentModuleIndex
        ? "next"
        : i < currentModuleIndex
          ? "done"
          : "current",
    lessons: m.lessons.map((l) => {
      const pos = position++;
      return {
        id: l.id,
        title: l.title,
        durationLabel: formatClock(l.durationSeconds),
        status:
          index < 0 || pos > index
            ? "next"
            : pos < index
              ? "done"
              : "current",
      };
    }),
  }));

  return {
    status: "ok",
    data: {
      slug: course.slug,
      title: course.title,
      description: course.description,
      coverImageUrl: courseCover(course.coverImageUrl),
      category: course.category,
      levelLabel: courseLevelLabel(course.level),
      stats: {
        lessonTotal: flat.length,
        durationLabel: formatDurationCompact(
          flat.reduce((n, f) => n + (f.lesson.durationSeconds ?? 0), 0)
        ),
        completedCount: Math.max(index, 0),
        moduleCount: course.modules.length,
      },
      percent: flat.length ? Math.round((Math.max(index, 0) / flat.length) * 100) : 0,
      currentLesson:
        index >= 0 ? { id: flat[index].lesson.id, number: index + 1 } : null,
      fresh: found < 0,
      modules,
    },
  };
}
