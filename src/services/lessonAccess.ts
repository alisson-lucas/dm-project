import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getVideoEmbed, type VideoEmbed } from "./videoEmbed";

// Lógica compartilhada pela rota de API (`/api/lessons/:id/player`) e pela
// página server-side (`/lessons/:id`). O frontend nunca sabe o provedor/ID do
// vídeo antes de passar por aqui — só recebe o embedUrl já resolvido, e só se
// o aluno tiver matrícula ATIVA no curso da aula.

export interface LessonSibling {
  id: string;
  title: string;
  order: number;
  durationSeconds: number | null;
}

export type LessonPlayerResult =
  | {
      ok: true;
      embed: VideoEmbed;
      lesson: {
        id: string;
        title: string;
        moduleTitle: string;
        courseTitle: string;
        courseSlug: string;
      };
      siblings: LessonSibling[];
    }
  | { ok: false; status: 404 | 403; message: string };

export async function getLessonPlayerForUser(
  lessonId: string,
  userId: string
): Promise<LessonPlayerResult> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: { select: { title: true, slug: true } },
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true, durationSeconds: true },
          },
        },
      },
    },
  });

  if (!lesson) {
    return { ok: false, status: 404, message: "aula não encontrada" };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: lesson.module.courseId },
    },
  });

  if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
    return { ok: false, status: 403, message: "acesso não liberado para este curso" };
  }

  return {
    ok: true,
    embed: getVideoEmbed(lesson),
    lesson: {
      id: lesson.id,
      title: lesson.title,
      moduleTitle: lesson.module.title,
      courseTitle: lesson.module.course.title,
      courseSlug: lesson.module.course.slug,
    },
    siblings: lesson.module.lessons,
  };
}
