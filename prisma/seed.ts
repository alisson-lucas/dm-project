import {
  PrismaClient,
  VideoProvider,
  CourseLevel,
  EnrollmentStatus,
  UserRole,
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
  // Vídeo de apresentação da tela do curso. PLACEHOLDER: hoje aponta pra uma
  // aula do próprio curso, só pra tela não nascer vazia — o professor ainda
  // precisa gravar uma apresentação de verdade. Omitir cai na capa.
  introVideoExternalId?: string;
  category: string;
  level: CourseLevel;
  // IDs de produto/oferta são PLACEHOLDER — troque pelos reais do painel Hotmart.
  productId: string;
  hotmartProductId: string;
  // link de checkout da Hotmart (botão "Comprar curso"). Se omitido, o seed
  // gera um placeholder a partir do hotmartProductId — troque pelo real.
  checkoutUrl?: string;
  modules: SeedModule[];
};

// NOTA: os ids (course-*, mod-*, lesson-*, product-*) são opacos e servem só
// pra o upsert ser idempotente — não precisam casar com o assunto.
//
// Sobre os vídeos, há DOIS grupos aqui:
//
// 1. "Improvisação e Modos Gregos" (o primeiro curso, e o único que o aluno
//    demo está cursando) usa os vídeos de aula REAIS do professor, do canal
//    youtube.com/@dinho09ish. Esses ficam.
//
// 2. Todos os outros cursos usam vídeos públicos de TERCEIROS (o canal de
//    origem está no comentário ao lado de cada id), só pra o catálogo ter
//    volume suficiente pra exercitar filtros, fileiras e a home em
//    desenvolvimento. Nenhum deles é nosso — troque pelos vídeos do
//    professor (ou apague os cursos) antes de ir pra produção.
//
// Em ambos os grupos, título/thumbnail/duração batem com o vídeo de verdade.
const COURSES: SeedCourse[] = [
  {
    // ---------------------------------------------------------------------
    // Curso do professor — vídeos dele, do próprio canal.
    // ---------------------------------------------------------------------
    id: "course-improvisacao",
    slug: "improvisacao-e-modos-gregos",
    title: "Improvisação e Modos Gregos",
    description:
      "Da pentatônica ao modo dórico: como sair das formas decoradas e improvisar com intenção, incluindo reharmonização.",
    coverImageUrl: yt("wn0NLjZj9Fc"),
    category: "Improvisação",
    level: CourseLevel.INTERMEDIATE,
    productId: "product-improvisacao",
    hotmartProductId: "0000008",
    modules: [
      {
        id: "mod-improv-pentatonica",
        title: "Soltando a pentatônica",
        order: 1,
        lessons: [
          {
            id: "lesson-improv-pentatonica",
            title: "4 formas de melhorar a pentatônica",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "wn0NLjZj9Fc", // Dinho Moska
            durationSeconds: 1565,
          },
        ],
      },
      {
        id: "mod-improv-modos",
        title: "Modos gregos na prática",
        order: 2,
        lessons: [
          {
            id: "lesson-improv-dorico",
            title: "Como improvisar utilizando o modo dórico",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "TzVVzM507OE", // Dinho Moska
            durationSeconds: 1459,
          },
          {
            id: "lesson-improv-reharmonizacao",
            title: "Modo dórico: reharmonização + improvisação",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "EAAX2o9nhw0", // Dinho Moska
            durationSeconds: 971,
          },
        ],
      },
    ],
  },
  {
    id: "course-nextjs",
    slug: "guitarra-para-iniciantes",
    title: "Guitarra para Iniciantes",
    description: "Postura, afinação e os primeiros acordes pra tocar suas primeiras músicas.",
    coverImageUrl: yt("807PLKGSYrc"),
    category: "Rock",
    level: CourseLevel.BEGINNER,
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
            title: "Postura e técnica desde o primeiro dia",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "807PLKGSYrc", // Kiko Loureiro
            durationSeconds: 339,
          },
          {
            id: "lesson-setup",
            title: "Posição das mãos e primeiros exercícios",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "o-oji9L52FQ", // Alex Martinho
            durationSeconds: 1497,
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
            title: "Como ler cifras e tocar os primeiros acordes",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "kVlZJBc8N7k", // Vilmar Gusberti
            durationSeconds: 537,
          },
          {
            id: "lesson-route-handlers",
            title: "Abertura da mão esquerda no braço",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "u0i_oCsQVh4", // Vilmar Gusberti
            durationSeconds: 638,
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
    coverImageUrl: yt("0pJvBI20kpc"),
    category: "Blues",
    level: CourseLevel.INTERMEDIATE,
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
            title: "As 5 posições da escala pentatônica",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "0pJvBI20kpc", // Leandro Kasan
            durationSeconds: 543,
          },
          {
            id: "lesson-ts-generics",
            title: "Licks na escala pentatônica",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "LY2ih09eGxY", // Cifra Club
            durationSeconds: 1129,
          },
        ],
      },
      {
        id: "mod-solos-blues",
        title: "Pentatônica no blues",
        order: 2,
        lessons: [
          {
            id: "lesson-solos-penta-blues",
            title: "Pentatônica menor e penta blues",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "ek0phEKndbU", // Cifra Club
            durationSeconds: 2785,
          },
          {
            id: "lesson-solos-aplicando",
            title: "Aplicando a pentatônica no solo",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "q5SXyNsMXd0", // Cifra Club
            durationSeconds: 1071,
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
    coverImageUrl: yt("fTc0h-Amfyw"),
    category: "MPB",
    level: CourseLevel.INTERMEDIATE,
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
            title: "Campo harmônico: o guia completo",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "fTc0h-Amfyw", // Vítor Lucena
            durationSeconds: 1506,
          },
          {
            id: "lesson-prisma-migrate",
            title: "As 5 sequências de acordes mais usadas",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "CdoBegVQ6_U", // Meu Violão
            durationSeconds: 308,
          },
          {
            id: "lesson-harmonia-menor",
            title: "Campo harmônico maior e menor",
            order: 3,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "LRCUzRibPwo", // Sidimar Antunes
            durationSeconds: 915,
          },
        ],
      },
    ],
  },
  {
    id: "course-blues-do-zero",
    slug: "blues-do-zero",
    title: "Blues do Zero",
    description:
      "Do primeiro shuffle ao improviso sobre doze compassos, com tablatura sincronizada em cada aula.",
    coverImageUrl: yt("h9uCwoG5caE"),
    category: "Blues",
    level: CourseLevel.BEGINNER,
    productId: "product-blues-do-zero",
    hotmartProductId: "0000003",
    modules: [
      {
        id: "mod-blues-levadas",
        title: "Primeiras levadas",
        order: 1,
        lessons: [
          {
            id: "lesson-blues-conducao",
            title: "A primeira condução de blues",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "h9uCwoG5caE", // MusicDot
            durationSeconds: 1107,
          },
          {
            id: "lesson-blues-shuffle",
            title: "Levada shuffle em três níveis",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "N847ljIJd6g", // Cordas e Música
            durationSeconds: 663,
          },
          {
            id: "lesson-blues-facil",
            title: "A levada de blues mais fácil que existe",
            order: 3,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "mNc6iNjXJtY", // Eduardo Feldberg
            durationSeconds: 211,
          },
        ],
      },
      {
        id: "mod-blues-solo",
        title: "Do shuffle ao solo",
        order: 2,
        lessons: [
          {
            // Única aula em Vimeo do seed — exercita o segundo provedor de
            // getVideoEmbed com um vídeo real.
            id: "lesson-blues-solo-e",
            title: "Solo sobre o shuffle em E",
            order: 1,
            videoProvider: VideoProvider.VIMEO,
            videoExternalId: "282799034", // Uke Like The Pros
            durationSeconds: 466,
          },
        ],
      },
    ],
  },
  {
    id: "course-fingerstyle",
    slug: "fingerstyle-brasileiro",
    title: "Fingerstyle Brasileiro: Base",
    description:
      "Polegar independente, baixo caminhante e três estudos completos pra soltar a mão direita.",
    coverImageUrl: yt("SRKkuUGzFns"),
    category: "Fingerstyle",
    level: CourseLevel.BEGINNER,
    productId: "product-fingerstyle",
    hotmartProductId: "0000004",
    modules: [
      {
        id: "mod-fingerstyle-base",
        title: "Mão direita independente",
        order: 1,
        lessons: [
          {
            id: "lesson-fingerstyle-zero",
            title: "Fingerstyle para iniciantes: nível zero",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "SRKkuUGzFns", // Heitor Castro
            durationSeconds: 858,
          },
          {
            id: "lesson-fingerstyle-pratica",
            title: "Como tocar fingerstyle na prática",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "3KEZMsLe04k", // Sidimar Antunes
            durationSeconds: 687,
          },
        ],
      },
    ],
  },
  {
    id: "course-riffs-rock",
    slug: "riffs-de-rock-classico",
    title: "Riffs de Rock Clássico",
    description:
      "Palhetada alternada e power chords em levadas de peso, riff a riff.",
    coverImageUrl: yt("YMC5wY8c3pU"),
    category: "Rock",
    level: CourseLevel.BEGINNER,
    productId: "product-riffs-rock",
    hotmartProductId: "0000005",
    modules: [
      {
        id: "mod-riffs-power",
        title: "Power chords e riffs",
        order: 1,
        lessons: [
          {
            id: "lesson-riffs-power",
            title: "5 riffs fáceis com power chords",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "YMC5wY8c3pU", // Portal Guitar Shred
            durationSeconds: 294,
          },
        ],
      },
      {
        id: "mod-riffs-palhetada",
        title: "Palhetada alternada",
        order: 2,
        lessons: [
          {
            id: "lesson-riffs-palhetada",
            title: "Palhetada alternada e suas diferenças",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "yFyeCuAbuuA", // Júnior Araújo
            durationSeconds: 609,
          },
          {
            id: "lesson-riffs-exercicios",
            title: "Exercícios de palhetada alternada",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "Sx-rQ1CX2tw", // TV Cifras
            durationSeconds: 743,
          },
        ],
      },
    ],
  },
  {
    id: "course-standards",
    slug: "improviso-sobre-standards",
    title: "Improviso sobre Standards",
    description:
      "Condução de vozes e frases sobre progressões de jazz, do II-V-I ao chorus inteiro.",
    coverImageUrl: yt("3kSPGjxI-ns"),
    category: "Jazz",
    level: CourseLevel.ADVANCED,
    productId: "product-standards",
    hotmartProductId: "0000006",
    modules: [
      {
        id: "mod-standards-vocabulario",
        title: "Vocabulário de improviso",
        order: 1,
        lessons: [
          {
            id: "lesson-standards-estilo",
            title: "Improvisando com estilo e domínio",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "3kSPGjxI-ns", // Luiz Criasom
            durationSeconds: 2370,
          },
          {
            id: "lesson-standards-slow",
            title: "Slow blues maior e menor",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "dGUV_z90XGo", // TV Cifras
            durationSeconds: 1075,
          },
          {
            // ÚNICA aula sem vídeo real do seed: a Panda Video hospeda em
            // conta privada, não existe id público pra usar de exemplo. O
            // embed em getVideoEmbed também aponta pro subdomínio placeholder
            // "player-vz-XXXX", então esta aula não toca de propósito — ela
            // existe só pra exercitar o terceiro provedor no código.
            id: "lesson-standards-chorus",
            title: "Chorus completo sobre um standard",
            order: 3,
            videoProvider: VideoProvider.PANDA,
            videoExternalId: "00000000-0000-0000-0000-000000000000",
            durationSeconds: 900,
          },
        ],
      },
    ],
  },
  {
    id: "course-cifras-mpb",
    slug: "cifras-da-mpb-no-violao",
    title: "Cifras da MPB no Violão",
    description:
      "Acordes com sétima, pestana e o balanço da bossa pra acompanhar qualquer roda.",
    coverImageUrl: yt("gx3wnn3goiQ"),
    category: "MPB",
    level: CourseLevel.BEGINNER,
    productId: "product-cifras-mpb",
    hotmartProductId: "0000007",
    modules: [
      {
        id: "mod-cifras-acordes",
        title: "Acordes e ritmo da MPB",
        order: 1,
        lessons: [
          {
            id: "lesson-cifras-setima",
            title: "Acordes com sétima: A7, D7 e E7",
            order: 1,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "-WrR8BujDlw", // Marcos Lima Violão
            durationSeconds: 244,
          },
          {
            id: "lesson-cifras-bossa",
            title: "Bossa nova: harmonia e ritmo",
            order: 2,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "gx3wnn3goiQ", // Marcelo Loss
            durationSeconds: 388,
          },
          {
            id: "lesson-cifras-samba",
            title: "Acordes para samba, MPB e bossa nova",
            order: 3,
            videoProvider: VideoProvider.YOUTUBE,
            videoExternalId: "cH1BRfOPUqs", // Eduardo Feldberg
            durationSeconds: 393,
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
    const checkoutUrl =
      c.checkoutUrl ?? `https://pay.hotmart.com/${c.hotmartProductId}`;

    // Apresentação do curso: quando o seed não traz uma, usa o vídeo da
    // primeira aula só pra tela não nascer vazia. É PLACEHOLDER — assim que o
    // professor gravar uma apresentação de verdade, troque aqui (ou direto no
    // banco, nas colunas intro_video_*).
    const primeiraAula = c.modules[0]?.lessons[0];
    const introVideoExternalId =
      c.introVideoExternalId ?? primeiraAula?.videoExternalId ?? null;
    const introVideoProvider = introVideoExternalId
      ? (primeiraAula?.videoProvider ?? VideoProvider.YOUTUBE)
      : null;

    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        category: c.category,
        level: c.level,
        checkoutUrl,
        introVideoProvider,
        introVideoExternalId,
      },
      create: {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        category: c.category,
        level: c.level,
        checkoutUrl,
        introVideoProvider,
        introVideoExternalId,
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

    // Poda o que saiu do seed antes de inserir: sem isso, mudar a estrutura de
    // módulos esbarra no @@unique([courseId, order]) / @@unique([moduleId, order]).
    // As aulas caem por cascade e as matrículas que apontavam pra elas voltam
    // pro início do curso (lastLessonId é SetNull).
    await prisma.module.deleteMany({
      where: { courseId: c.id, id: { notIn: c.modules.map((m) => m.id) } },
    });

    for (const m of c.modules) {
      await prisma.module.upsert({
        where: { id: m.id },
        update: { title: m.title, order: m.order, courseId: c.id },
        create: { id: m.id, title: m.title, order: m.order, courseId: c.id },
      });

      await prisma.lesson.deleteMany({
        where: { moduleId: m.id, id: { notIn: m.lessons.map((l) => l.id) } },
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

  // Por id, não por índice: mexer na ordem de COURSES não pode bagunçar as
  // matrículas de demonstração.
  const byId = (id: string) => {
    const found = COURSES.find((c) => c.id === id);
    if (!found) throw new Error(`curso ${id} não existe em COURSES`);
    return found;
  };
  const improviso = byId("course-improvisacao");
  const iniciantes = byId("course-nextjs");
  const solos = byId("course-typescript");

  // -----------------------------------------------------------------------
  // Usuários + matrículas (um de cada estado, pra exercitar as rotas)
  // -----------------------------------------------------------------------
  const people: Array<{
    id: string;
    email: string;
    name: string;
    passwordHash: string | null;
    role?: UserRole;
    // matrículas: [courseId, status, lastLessonId?]
    // lastLessonId alimenta o "Continue de onde parou" da home.
    enrollments: Array<[string, EnrollmentStatus, string?]>;
  }> = [
    {
      // O professor. Entra pelo mesmo /login dos alunos e é o papel no banco
      // que libera o /admin — não existe senha nem rota separada de admin.
      id: "user-admin",
      email: "professor@dmproject.com.br",
      name: "Dinho Moska",
      passwordHash,
      role: UserRole.ADMIN,
      enrollments: [],
    },
    {
      id: "user-ativo",
      email: "aluno.ativo@example.com",
      name: "Aluno Ativo",
      passwordHash, // já pode logar — vê os 3 cursos no catálogo
      enrollments: [
        // O "Continue de onde parou" da home aponta pra cá (é a única
        // matrícula com lastWatchedAt), então o hero mostra um vídeo do
        // próprio professor. Parou na 1ª aula do módulo 2 → módulo 1
        // concluído, módulo 2 em curso.
        [improviso.id, EnrollmentStatus.ACTIVE, "lesson-improv-dorico"],
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
      update: {
        name: p.name,
        passwordHash: p.passwordHash,
        role: p.role ?? UserRole.STUDENT,
      },
      create: {
        id: p.id,
        email: p.email,
        name: p.name,
        passwordHash: p.passwordHash,
        role: p.role ?? UserRole.STUDENT,
      },
    });

    for (const [courseId, status, lastLessonId] of p.enrollments) {
      const now = new Date();
      const progress = {
        lastLessonId: lastLessonId ?? null,
        lastWatchedAt: lastLessonId ? now : null,
      };
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: p.id, courseId } },
        update: {
          status,
          grantedAt: status === EnrollmentStatus.PENDING ? null : now,
          revokedAt: status === EnrollmentStatus.REVOKED ? now : null,
          ...progress,
        },
        create: {
          userId: p.id,
          courseId,
          status,
          sourceTransaction: `seed-${p.id}`,
          grantedAt: status === EnrollmentStatus.PENDING ? null : now,
          revokedAt: status === EnrollmentStatus.REVOKED ? now : null,
          ...progress,
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
    { email: "aluno.ativo@example.com", senha: DEMO_PASSWORD, cursos: "Improvisação (em curso) + Guitarra p/ Iniciantes + Solos" },
    { email: "aluno.pendente@example.com", senha: "(definir em /api/auth/set-password)", cursos: "Guitarra p/ Iniciantes (PENDING)" },
    { email: "aluno.revogado@example.com", senha: DEMO_PASSWORD, cursos: "Guitarra p/ Iniciantes (REVOKED)" },
    { email: "sem.matricula@example.com", senha: DEMO_PASSWORD, cursos: "—" },
  ]);
  console.log(
    "\nHome em /  ·  curso do professor em /courses/improvisacao-e-modos-gregos" +
      "  ·  aula em /lessons/lesson-improv-dorico  ·  catálogo em /explorar"
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
