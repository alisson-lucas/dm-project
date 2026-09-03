import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Catálogo da tela inicial (/): TODOS os cursos existentes, cada um marcado com
// `enrolled` (se o usuário tem matrícula ATIVA nele). A lista "enrolled" é só um
// atalho pra seção "Seus cursos".
export async function getCatalog(userId: string) {
  const [courses, activeEnrollments] = await Promise.all([
    prisma.course.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { modules: true } },
        // as durações vêm junto pra o card mostrar "14 aulas · 3h20"
        modules: { select: { lessons: { select: { durationSeconds: true } } } },
      },
    }),
    prisma.enrollment.findMany({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      select: { courseId: true },
    }),
  ]);

  const enrolledIds = new Set(activeEnrollments.map((e) => e.courseId));

  const all = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    coverImageUrl: c.coverImageUrl,
    category: c.category,
    level: c.level,
    moduleCount: c._count.modules,
    lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
    durationSeconds: c.modules.reduce(
      (n, m) => n + m.lessons.reduce((s, l) => s + (l.durationSeconds ?? 0), 0),
      0
    ),
    enrolled: enrolledIds.has(c.id),
  }));

  return { all, enrolled: all.filter((c) => c.enrolled) };
}

export type CatalogCourse = Awaited<ReturnType<typeof getCatalog>>["all"][number];

// A ficha de um curso específico vive em ./coursePage (getCoursePageForUser) —
// ela precisa do progresso da matrícula, não só do catálogo.
