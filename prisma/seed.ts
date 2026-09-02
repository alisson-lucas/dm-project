import {
  PrismaClient,
  VideoProvider,
  EnrollmentStatus,
  WebhookEventStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

// Dados de exemplo pra desenvolver sem depender de compras reais da Hotmart.
//
// Rode com:  npm run prisma:seed     (precisa do .env + migrations aplicadas)
// É idempotente — todos os registros usam id fixo + upsert, então pode rodar
// quantas vezes quiser.

const prisma = new PrismaClient();

// senha em texto puro dos usuários de teste que já têm senha definida
const DEMO_PASSWORD = "senha12345";

// yt("id") = thumbnail pública do YouTube, só pra dar cara de catálogo.
const yt = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

type SeedLesson = {
  id: string;
  title: string;
  order: number;
  videoProvider: VideoProvider;
  videoExternalId: string;
  durationSeconds: number;
};
type SeedModule = { id: string; title: string; order: number; lessons: SeedLesson[] };
type SeedCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  // IDs de produto/oferta são PLACEHOLDER — troque pelos reais do painel Hotmart.
  productId: string;
  hotmartProductId: string;
  modules: SeedModule[];
};

// NOTA: os `id` (course-*, mod-*, lesson-*, product-*) são opacos e servem só
// pra o upsert ser idempotente — não precisam casar com o assunto. Os IDs de
// vídeo (videoExternalId) e as capas são placeholder; troque pelos reais.
const COURSES: SeedCourse[] = [
  {
    id: "course-nextjs",
    slug: "guitarra-para-iniciantes",
    title: "Guitarra para Iniciantes",
    description: "Postura, afinação e os primeiros acordes pra tocar suas primeiras músicas.",
    coverImageUrl: yt("jNQXAC9IVRw"),
    productId: "product-nextjs",
    hotmartProductId: "0000000",
    modules: [
      {
        id: "mod-intro",
        title: "Primeiros passos",
        order: 1,
        lessons: [
          {
            id: "lesson-boas-vindas",
            title: "Conhecendo a guitarra",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "jNQXAC9IVRw",
            durationSeconds: 60,
          },
          {
            id: "lesson-setup",
            title: "Afinação e postura das mãos",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "8aGhZQkoFbQ",
            durationSeconds: 720,
          },
        ],
      },
      {
        id: "mod-rotas",
        title: "Acordes e ritmo",
        order: 2,
        lessons: [
          {
            id: "lesson-app-router",
            title: "Acordes maiores e menores",
            order: 1,
            videoProvider: VideoProvider.VIMEO,
            videoExternalId: "76979871",
            durationSeconds: 900,
          },
          {
            id: "lesson-route-handlers",
            title: "Batidas e levadas essenciais",
            order: 2,
            videoProvider: VideoProvider.PANDA,
            // Panda usa um UUID por vídeo — placeholder até ter conta configurada
            videoExternalId: "00000000-0000-0000-0000-000000000000",
            durationSeconds: 1080,
          },
        ],
      },
    ],
  },
  {
    id: "course-typescript",
    slug: "solos-e-improviso",
    title: "Solos e Improviso",
    description: "Escala pentatônica, fraseado e técnica pra improvisar com liberdade.",
    coverImageUrl: yt("BCg4U1FzODs"),
    productId: "product-typescript",
    hotmartProductId: "0000001",
    modules: [
      {
        id: "mod-ts-basico",
        title: "Pentatônica na prática",
        order: 1,
        lessons: [
          {
            id: "lesson-ts-tipos",
            title: "As 5 posições da pentatônica",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "BCg4U1FzODs",
            durationSeconds: 540,
          },
          {
            id: "lesson-ts-generics",
            title: "Bend, hammer-on e pull-off",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "nViEqpgwxHE",
            durationSeconds: 780,
          },
        ],
      },
    ],
  },
  {
    // NINGUÉM tem matrícula ativa aqui no seed — serve pra ver o card "não
    // matriculado" no catálogo e a tela de acesso negado em /courses/[slug].
    id: "course-prisma",
    slug: "harmonia-no-braco",
    title: "Harmonia no Braço",
    description: "Campo harmônico, formação de acordes e progressões que sempre funcionam.",
    coverImageUrl: yt("rLRIB6AF2Dg"),
    productId: "product-prisma",
    hotmartProductId: "0000002",
    modules: [
      {
        id: "mod-prisma-intro",
        title: "Campo harmônico maior",
        order: 1,
        lessons: [
          {
            id: "lesson-prisma-schema",
            title: "Montando o campo harmônico",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "rLRIB6AF2Dg",
            durationSeconds: 600,
          },
          {
            id: "lesson-prisma-migrate",
            title: "Progressões mais usadas",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "b4nxOv91Zpw",
            durationSeconds: 660,
          },
        ],
      },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // -----------------------------------------------------------------------
  // Cursos → produto Hotmart → módulos → aulas
  // -----------------------------------------------------------------------
  for (const c of COURSES) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
      },
      create: {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
      },
    });

    await prisma.product.upsert({
      where: { id: c.productId },
      update: { courseId: c.id },
      create: {
        id: c.productId,
        hotmartProductId: c.hotmartProductId,
        hotmartOfferCode: null,
        courseId: c.id,
      },
    });

    for (const m of c.modules) {
      await prisma.module.upsert({
        where: { id: m.id },
        update: { title: m.title, order: m.order, courseId: c.id },
        create: { id: m.id, title: m.title, order: m.order, courseId: c.id },
      });

      for (const l of m.lessons) {
        await prisma.lesson.upsert({
          where: { id: l.id },
          update: {
            moduleId: m.id,
            title: l.title,
            order: l.order,
            videoProvider: l.videoProvider,
            videoExternalId: l.videoExternalId,
            durationSeconds: l.durationSeconds,
          },
          create: {
            id: l.id,
            moduleId: m.id,
            title: l.title,
            order: l.order,
            videoProvider: l.videoProvider,
            videoExternalId: l.videoExternalId,
            durationSeconds: l.durationSeconds,
          },
        });
      }
    }
  }

  const iniciantes = COURSES[0];
  const solos = COURSES[1];

  // -----------------------------------------------------------------------
  // Usuários + matrículas (um de cada estado, pra exercitar as rotas)
  // -----------------------------------------------------------------------
  const people: Array<{
    id: string;
    email: string;
    name: string;
    passwordHash: string | null;
    // matrículas: [courseId, status]
    enrollments: Array<[string, EnrollmentStatus]>;
  }> = [
    {
      id: "user-ativo",
      email: "aluno.ativo@example.com",
      name: "Aluno Ativo",
      passwordHash, // já pode logar — vê os 2 cursos no catálogo
      enrollments: [
        [iniciantes.id, EnrollmentStatus.ACTIVE],
        [solos.id, EnrollmentStatus.ACTIVE],
      ],
    },
    {
      id: "user-pendente",
      email: "aluno.pendente@example.com",
      name: "Aluno Pendente",
      passwordHash: null, // conta criada pelo webhook: use /api/auth/set-password
      enrollments: [[iniciantes.id, EnrollmentStatus.PENDING]],
    },
    {
      id: "user-revogado",
      email: "aluno.revogado@example.com",
      name: "Aluno Revogado",
      passwordHash,
      enrollments: [[iniciantes.id, EnrollmentStatus.REVOKED]],
    },
    {
      id: "user-sem-matricula",
      email: "sem.matricula@example.com",
      name: "Sem Matrícula",
      passwordHash,
      enrollments: [],
    },
  ];

  for (const p of people) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, passwordHash: p.passwordHash },
      create: {
        id: p.id,
        email: p.email,
        name: p.name,
        passwordHash: p.passwordHash,
      },
    });

    for (const [courseId, status] of p.enrollments) {
      const now = new Date();
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: p.id, courseId } },
        update: {
          status,
          grantedAt: status === EnrollmentStatus.PENDING ? null : now,
          revokedAt: status === EnrollmentStatus.REVOKED ? now : null,
        },
        create: {
          userId: p.id,
          courseId,
          status,
          sourceTransaction: `seed-${p.id}`,
          grantedAt: status === EnrollmentStatus.PENDING ? null : now,
          revokedAt: status === EnrollmentStatus.REVOKED ? now : null,
        },
      });
    }
  }

  // -----------------------------------------------------------------------
  // Um evento de webhook de exemplo (pra ver a tabela no Prisma Studio)
  // -----------------------------------------------------------------------
  await prisma.webhookEvent.upsert({
    where: { eventId: "seed-tx-0001" },
    update: {},
    create: {
      eventId: "seed-tx-0001",
      eventType: "PURCHASE_APPROVED",
      payload: { seed: true, note: "evento de exemplo criado pelo seed" },
      status: WebhookEventStatus.PROCESSED,
      processedAt: new Date(),
    },
  });

  console.log("Seed concluído.\n");
  console.table([
    { email: "aluno.ativo@example.com", senha: DEMO_PASSWORD, cursos: "Guitarra p/ Iniciantes + Solos (ACTIVE)" },
    { email: "aluno.pendente@example.com", senha: "(definir em /api/auth/set-password)", cursos: "Guitarra p/ Iniciantes (PENDING)" },
    { email: "aluno.revogado@example.com", senha: DEMO_PASSWORD, cursos: "Guitarra p/ Iniciantes (REVOKED)" },
    { email: "sem.matricula@example.com", senha: DEMO_PASSWORD, cursos: "—" },
  ]);
  console.log(
    "\nCatálogo em /  ·  curso em /courses/guitarra-para-iniciantes  ·  aula em /lessons/lesson-boas-vindas"
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
