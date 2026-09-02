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
        modules: { select: { _count: { select: { lessons: true } } } },
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
    moduleCount: c._count.modules,
    lessonCount: c.modules.reduce((n, m) => n + m._count.lessons, 0),
    enrolled: enrolledIds.has(c.id),
  }));

  return { all, enrolled: all.filter((c) => c.enrolled) };
}

export type CatalogCourse = Awaited<ReturnType<typeof getCatalog>>["all"][number];

// Um curso específico (por slug), com módulos e aulas ordenados — mas só se o
// aluno tiver matrícula ATIVA nele. Usado na página interna /courses/[slug].
export async function getCourseForUser(userId: string, slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) return { status: "not-found" as const };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
    return { status: "forbidden" as const };
  }

  const firstLesson = course.modules.flatMap((m) => m.lessons)[0] ?? null;
  return { status: "ok" as const, course, firstLesson };
}

export type CourseForUser = Awaited<ReturnType<typeof getCourseForUser>>;
export type CourseWithModules = Extract<
  CourseForUser,
  { status: "ok" }
>["course"];
export type CourseModule = CourseWithModules["modules"][number];
