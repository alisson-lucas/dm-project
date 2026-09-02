import { prisma } from "../lib/prisma";
import { EnrollmentStatus } from "@prisma/client";
import type { NormalizedHotmartEvent } from "../lib/hotmartPayload";

// Encontra o curso correspondente ao produto/oferta da Hotmart. Prioriza um
// match exato de oferta; cai pro registro "curinga" (hotmartOfferCode null)
// se o produto não usa múltiplas ofertas.
async function resolveProduct(event: NormalizedHotmartEvent) {
  const exact = event.hotmartOfferCode
    ? await prisma.product.findUnique({
        where: {
          hotmartProductId_hotmartOfferCode: {
            hotmartProductId: event.hotmartProductId,
            hotmartOfferCode: event.hotmartOfferCode,
          },
        },
      })
    : null;

  const product =
    exact ??
    (await prisma.product.findFirst({
      where: { hotmartProductId: event.hotmartProductId, hotmartOfferCode: null },
    }));

  if (!product) {
    throw new Error(
      `Nenhum curso mapeado para o produto Hotmart ${event.hotmartProductId} (oferta ${event.hotmartOfferCode ?? "-"})`
    );
  }

  return product;
}

async function findOrCreateUser(event: NormalizedHotmartEvent) {
  return prisma.user.upsert({
    where: { email: event.buyerEmail },
    update: event.buyerName ? { name: event.buyerName } : {},
    create: { email: event.buyerEmail, name: event.buyerName },
  });
}

export async function grantAccess(event: NormalizedHotmartEvent) {
  const product = await resolveProduct(event);
  const user = await findOrCreateUser(event);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: product.courseId } },
    update: {
      status: EnrollmentStatus.ACTIVE,
      sourceTransaction: event.transactionId,
      grantedAt: new Date(),
      revokedAt: null,
      scheduledRevocationAt: null,
    },
    create: {
      userId: user.id,
      courseId: product.courseId,
      status: EnrollmentStatus.ACTIVE,
      sourceTransaction: event.transactionId,
      grantedAt: new Date(),
    },
  });

  // TODO: disparar e-mail de boas-vindas com o link de acesso (e de definição
  // de senha, se o usuário acabou de ser criado agora pelo upsert acima).
}

export async function revokeAccess(event: NormalizedHotmartEvent) {
  const product = await resolveProduct(event);
  const user = await prisma.user.findUnique({ where: { email: event.buyerEmail } });
  if (!user) return; // nunca teve acesso, nada a revogar

  await prisma.enrollment.updateMany({
    where: { userId: user.id, courseId: product.courseId },
    data: { status: EnrollmentStatus.REVOKED, revokedAt: new Date(), sourceTransaction: event.transactionId },
  });
}

export async function markPending(event: NormalizedHotmartEvent) {
  const product = await resolveProduct(event);
  const user = await findOrCreateUser(event);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: product.courseId } },
    update: { status: EnrollmentStatus.PENDING, sourceTransaction: event.transactionId },
    create: {
      userId: user.id,
      courseId: product.courseId,
      status: EnrollmentStatus.PENDING,
      sourceTransaction: event.transactionId,
    },
  });
}

// Usado em SUBSCRIPTION_CANCELLATION: o aluno já pagou o ciclo atual, então o
// acesso continua ACTIVE até revokeAt — quem efetivamente revoga é o job em
// src/jobs/revokeExpiredEnrollments.ts, rodando periodicamente.
export async function scheduleAccessRevocation(event: NormalizedHotmartEvent, revokeAt: Date) {
  const product = await resolveProduct(event);
  const user = await prisma.user.findUnique({ where: { email: event.buyerEmail } });
  if (!user) return;

  await prisma.enrollment.updateMany({
    where: { userId: user.id, courseId: product.courseId },
    data: { scheduledRevocationAt: revokeAt },
  });
}
