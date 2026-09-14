import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getVideoEmbed, type VideoEmbed } from "./videoEmbed";

// Lógica compartilhada pela rota de API (`/api/lessons/:id/player`) e pela
// página server-side (`/lessons/:id`). O frontend nunca sabe o provedor/ID do
// vídeo antes de passar por aqui — só recebe o embedUrl já resolvido, e só se
// o aluno tiver matrícula ATIVA no curso da aula.
//
// A consulta traz o CURSO INTEIRO (módulos + aulas), não só as aulas irmãs do
// módulo atual. É uma query só, e é o que permite a tela saber em que ponto da
// trilha o aluno está e para onde ele vai quando o vídeo acabar — antes ele
// terminava a aula e ficava sem nada pra clicar.

export interface LessonRef {
  id: string;
  title: string;
  durationSeconds: number | null;
}

export interface LessonModule {
  id: string;
  /** "01", "02"… na ordem do curso */
  number: string;
  title: string;
  lessons: LessonRef[];
}

export type LessonPlayerResult =
  | {
      ok: true;
      embed: VideoEmbed;
      lesson: {
        id: string;
        title: string;
        durationSeconds: number | null;
        moduleTitle: string;
        /** "02" — posição do módulo no curso */
        moduleNumber: string;
        courseId: string;
        courseTitle: string;
        courseSlug: string;
        /** posição da aula no curso inteiro, contando de 1 */
        position: number;
      };
      /** todas as aulas do curso, na ordem, agrupadas por módulo */
      modules: LessonModule[];
      /** total de aulas do curso */
      lessonTotal: number;
      previous: LessonRef | null;
      /** próxima aula do curso — atravessa a fronteira do módulo */
      next: (LessonRef & { moduleTitle: string }) | null;
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
          course: {
            select: {
              title: true,
              slug: true,
              modules: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  lessons: {
                    orderBy: { order: "asc" },
                    select: { id: true, title: true, durationSeconds: true },
                  },
                },
              },
            },
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

  const modules: LessonModule[] = lesson.module.course.modules.map((m, i) => ({
    id: m.id,
    number: String(i + 1).padStart(2, "0"),
    title: m.title,
    lessons: m.lessons,
  }));

  // Lista achatada na ordem em que o aluno assiste: é dela que saem a posição,
  // a anterior e a próxima. Achatar aqui (e não na tela) mantém a regra de
  // "qual é a próxima" num lugar só.
  const flat = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );
  const index = flat.findIndex((l) => l.id === lesson.id);

  const moduleIndex = modules.findIndex((m) => m.id === lesson.moduleId);

  return {
    ok: true,
    embed: getVideoEmbed(lesson),
    lesson: {
      id: lesson.id,
      title: lesson.title,
      durationSeconds: lesson.durationSeconds,
      moduleTitle: lesson.module.title,
      moduleNumber: String(moduleIndex + 1).padStart(2, "0"),
      courseId: lesson.module.courseId,
      courseTitle: lesson.module.course.title,
      courseSlug: lesson.module.course.slug,
      position: index + 1,
    },
    modules,
    lessonTotal: flat.length,
    previous: index > 0 ? flat[index - 1] : null,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null,
  };
}
