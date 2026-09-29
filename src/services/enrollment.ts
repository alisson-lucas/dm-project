import { prisma } from "../lib/prisma";
import { EnrollmentStatus } from "@prisma/client";
import type { NormalizedHotmartEvent } from "../lib/hotmartPayload";
import { AccessTokenPurpose, criarToken } from "./accessToken";
import { emailDeBoasVindas, enviarEmail } from "./email";

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

  // E-mail de boas-vindas com o link pra criar a senha.
  //
  // A condição é `passwordHash === null`, e não "o usuário é novo": quem
  // comprou antes e nunca chegou a definir a senha continua sem conseguir
  // entrar, e uma compra nova é justamente a hora de mandar o link de novo.
  //
  // Falha de e-mail NÃO derruba a liberação de acesso: a matrícula já está
  // gravada, e `enviarEmail` registra o link no log do servidor quando não
  // consegue entregar. Perder o acesso por causa do provedor de e-mail seria
  // trocar um problema por um pior.
  if (user.passwordHash === null) {
    try {
      const { token } = await criarToken(user.id, AccessTokenPurpose.FIRST_ACCESS);
      const curso = await prisma.course.findUnique({
        where: { id: product.courseId },
        select: { title: true },
      });
      await enviarEmail(
        emailDeBoasVindas(user.email, token, curso?.title ?? "seu curso")
      );
    } catch (err) {
      console.error("Falha ao preparar o e-mail de boas-vindas", user.email, err);
    }
  }
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
