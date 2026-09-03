import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Ponteiro de "continue de onde parou". A página da aula chama isso depois de
// já ter respondido (next/server `after`), então nunca atrasa o player — e um
// erro aqui não pode derrubar a página.
//
// `updateMany` de propósito: se a matrícula não existir ou não estiver ATIVA,
// simplesmente não atualiza nada (0 linhas), sem lançar.
export async function markLessonWatched(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<void> {
  try {
    await prisma.enrollment.updateMany({
      where: { userId, courseId, status: EnrollmentStatus.ACTIVE },
      data: { lastLessonId: lessonId, lastWatchedAt: new Date() },
    });
  } catch (err) {
    console.error("markLessonWatched falhou", { userId, courseId, lessonId, err });
  }
}
