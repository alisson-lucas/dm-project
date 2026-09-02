import { prisma } from "../lib/prisma";
import { EnrollmentStatus } from "@prisma/client";

// Rode isso periodicamente (cron a cada hora, por exemplo). Efetiva a
// revogação de acesso agendada por scheduleAccessRevocation() — usado quando
// uma assinatura é cancelada mas o aluno ainda tinha ciclo pago restante.
export async function revokeExpiredEnrollments() {
  const due = await prisma.enrollment.findMany({
    where: {
      status: EnrollmentStatus.ACTIVE,
      scheduledRevocationAt: { lte: new Date() },
    },
  });

  for (const enrollment of due) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: EnrollmentStatus.REVOKED, revokedAt: new Date(), scheduledRevocationAt: null },
    });
  }

  return due.length;
}
