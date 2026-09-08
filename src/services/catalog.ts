import { EnrollmentStatus } from "@prisma/client";
import type { Course, CourseLevel } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { courseCover } from "../lib/covers";

type CourseWithCounts = Course & {
  _count: { modules: number };
  modules: { lessons: { durationSeconds: number | null }[] }[];
};

const courseInclude = {
  _count: { select: { modules: true } },
  // durações vêm junto pra o card mostrar "14 aulas · 3h20"
  modules: { select: { lessons: { select: { durationSeconds: true } } } },
} as const;

function toCard(c: CourseWithCounts, enrolled: boolean) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    coverImageUrl: courseCover(c.coverImageUrl),
    category: c.category,
    level: c.level as CourseLevel | null,
    checkoutUrl: c.checkoutUrl,
    moduleCount: c._count.modules,
    lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
    durationSeconds: c.modules.reduce(
      (n, m) => n + m.lessons.reduce((s, l) => s + (l.durationSeconds ?? 0), 0),
      0
    ),
    enrolled,
  };
}

// TODOS os cursos existentes, cada um marcado com `enrolled` (matrícula ATIVA
// do usuário). Usado em /app/explorar — a descoberta acontece dentro da
// plataforma, mas o acesso ao conteúdo continua exigindo compra.
export async function getCatalog(userId: string) {
  const [courses, active] = await Promise.all([
    prisma.course.findMany({ orderBy: { createdAt: "asc" }, include: courseInclude }),
    prisma.enrollment.findMany({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      select: { courseId: true },
    }),
  ]);

  const enrolledIds = new Set(active.map((e) => e.courseId));
  return { all: courses.map((c) => toCard(c, enrolledIds.has(c.id))) };
}

// Só os cursos comprados (matrícula ATIVA), ordenados pelo assistido mais
// recentemente (quem nunca abriu vai pro fim). Usado na home /app.
export async function getMyCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: EnrollmentStatus.ACTIVE },
    orderBy: [
      { lastWatchedAt: { sort: "desc", nulls: "last" } },
      { grantedAt: "desc" },
    ],
    include: { course: { include: courseInclude } },
  });

  return enrollments.map((e) => toCard(e.course, true));
}

export type CatalogCourse = Awaited<ReturnType<typeof getCatalog>>["all"][number];

// A ficha de um curso específico vive em ./coursePage (getCoursePageForUser) —
// ela precisa do progresso da matrícula, não só do catálogo.
