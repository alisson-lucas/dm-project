import { Prisma, type VideoProvider } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Conteúdo do curso pelo painel: o mapa de produtos da Hotmart, os módulos e as
// aulas. Mesma divisão de adminCourses.ts — a validação mora aqui, não no
// formulário, porque Server Action é endpoint HTTP como qualquer outro.

// ---------------------------------------------------------------------------
// Produtos da Hotmart
// ---------------------------------------------------------------------------
//
// É a peça que faz a compra virar acesso: o webhook chega com o id do produto
// (e às vezes o código da oferta) e procura aqui qual curso liberar. Sem uma
// linha destas, o aluno paga e o processamento morre em "Nenhum curso mapeado"
// — ver services/enrollment.ts#resolveProduct.

export interface ProductInput {
  hotmartProductId: string;
  /** null = vale pra qualquer oferta do produto (o "curinga") */
  hotmartOfferCode: string | null;
}

export type ProductErrors = Partial<Record<keyof ProductInput, string>>;

export async function criarProduto(
  courseId: string,
  input: ProductInput
): Promise<{ ok: true } | { ok: false; erros: ProductErrors }> {
  if (!input.hotmartProductId.trim()) {
    return {
      ok: false,
      erros: { hotmartProductId: "O código do produto é obrigatório." },
    };
  }

  try {
    await prisma.product.create({ data: { ...input, courseId } });
    return { ok: true };
  } catch (e) {
    // P2002 no par [hotmartProductId, hotmartOfferCode]: esse produto já está
    // ligado a algum curso. Deixar dois cursos disputando a mesma compra seria
    // pior do que recusar aqui.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        ok: false,
        erros: {
          hotmartProductId:
            "Este produto (com esta oferta) já está ligado a um curso.",
        },
      };
    }
    throw e;
  }
}

export async function excluirProduto(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Módulos
// ---------------------------------------------------------------------------

/** próxima posição livre — `order` é único por curso/módulo */
async function proximaOrdemDeModulo(courseId: string): Promise<number> {
  const ultimo = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (ultimo?.order ?? 0) + 1;
}

export async function criarModulo(
  courseId: string,
  title: string
): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!title.trim()) return { ok: false, erro: "O nome do módulo é obrigatório." };

  await prisma.module.create({
    data: { courseId, title: title.trim(), order: await proximaOrdemDeModulo(courseId) },
  });
  return { ok: true };
}

export async function renomearModulo(
  id: string,
  title: string
): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!title.trim()) return { ok: false, erro: "O nome do módulo é obrigatório." };

  await prisma.module.update({ where: { id }, data: { title: title.trim() } });
  return { ok: true };
}

/** as aulas caem junto (onDelete: Cascade no schema) */
export async function excluirModulo(id: string): Promise<void> {
  await prisma.module.delete({ where: { id } });
}

// Trocar a posição de dois vizinhos esbarraria no @@unique([courseId, order])
// no meio do caminho, então o primeiro passa por uma posição temporária. Tudo
// numa transação: interromper na metade deixaria um módulo em `order: -1`.
export async function moverModulo(id: string, direcao: "cima" | "baixo") {
  const atual = await prisma.module.findUnique({ where: { id } });
  if (!atual) return;

  const vizinho = await prisma.module.findFirst({
    where:
      direcao === "cima"
        ? { courseId: atual.courseId, order: { lt: atual.order } }
        : { courseId: atual.courseId, order: { gt: atual.order } },
    orderBy: { order: direcao === "cima" ? "desc" : "asc" },
  });
  if (!vizinho) return; // já está na ponta

  await prisma.$transaction([
    prisma.module.update({ where: { id: atual.id }, data: { order: -1 } }),
    prisma.module.update({ where: { id: vizinho.id }, data: { order: atual.order } }),
    prisma.module.update({ where: { id: atual.id }, data: { order: vizinho.order } }),
  ]);
}

// ---------------------------------------------------------------------------
// Aulas
// ---------------------------------------------------------------------------

export interface LessonInput {
  title: string;
  videoProvider: VideoProvider;
  videoExternalId: string;
  durationSeconds: number | null;
}

export type LessonErrors = Partial<Record<keyof LessonInput, string>>;

// Aceita "1:05:30", "24:19" ou o número cru de segundos. Em branco = sem
// duração, que a tela já sabe exibir (a aula some do somatório e pronto).
export function lerDuracao(
  valor: string
): { ok: true; segundos: number | null } | { ok: false } {
  const v = valor.trim();
  if (!v) return { ok: true, segundos: null };

  const relogio = /^(?:(\d+):)?(\d{1,2}):([0-5]\d)$/.exec(v);
  if (relogio) {
    const [, h, m, s] = relogio;
    return {
      ok: true,
      segundos: Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s),
    };
  }

  if (/^\d+$/.test(v)) return { ok: true, segundos: Number(v) };

  return { ok: false };
}

function validarAula(input: LessonInput): LessonErrors {
  const erros: LessonErrors = {};
  if (!input.title.trim()) erros.title = "O título da aula é obrigatório.";
  if (!input.videoExternalId.trim()) {
    erros.videoExternalId = "Sem o código do vídeo a aula abre um player vazio.";
  }
  return erros;
}

async function proximaOrdemDeAula(moduleId: string): Promise<number> {
  const ultima = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (ultima?.order ?? 0) + 1;
}

export async function criarAula(
  moduleId: string,
  input: LessonInput
): Promise<{ ok: true } | { ok: false; erros: LessonErrors }> {
  const erros = validarAula(input);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  await prisma.lesson.create({
    data: {
      moduleId,
      title: input.title.trim(),
      videoProvider: input.videoProvider,
      videoExternalId: input.videoExternalId.trim(),
      durationSeconds: input.durationSeconds,
      order: await proximaOrdemDeAula(moduleId),
    },
  });
  return { ok: true };
}

export async function atualizarAula(
  id: string,
  input: LessonInput
): Promise<{ ok: true } | { ok: false; erros: LessonErrors }> {
  const erros = validarAula(input);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  await prisma.lesson.update({
    where: { id },
    data: {
      title: input.title.trim(),
      videoProvider: input.videoProvider,
      videoExternalId: input.videoExternalId.trim(),
      durationSeconds: input.durationSeconds,
    },
  });
  return { ok: true };
}

// A matrícula que apontava pra esta aula como "última assistida" volta pro
// começo do curso sozinha — lastLessonId é SetNull no schema.
export async function excluirAula(id: string): Promise<void> {
  await prisma.lesson.delete({ where: { id } });
}

export async function moverAula(id: string, direcao: "cima" | "baixo") {
  const atual = await prisma.lesson.findUnique({ where: { id } });
  if (!atual) return;

  const vizinha = await prisma.lesson.findFirst({
    where:
      direcao === "cima"
        ? { moduleId: atual.moduleId, order: { lt: atual.order } }
        : { moduleId: atual.moduleId, order: { gt: atual.order } },
    orderBy: { order: direcao === "cima" ? "desc" : "asc" },
  });
  if (!vizinha) return;

  await prisma.$transaction([
    prisma.lesson.update({ where: { id: atual.id }, data: { order: -1 } }),
    prisma.lesson.update({ where: { id: vizinha.id }, data: { order: atual.order } }),
    prisma.lesson.update({ where: { id: atual.id }, data: { order: vizinha.order } }),
  ]);
}

// ---------------------------------------------------------------------------
// Leitura pro painel
// ---------------------------------------------------------------------------

/** curso com produtos, módulos e aulas — tudo que a página de edição precisa */
export async function buscarConteudo(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      products: { orderBy: { createdAt: "asc" } },
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export type ConteudoDoCurso = NonNullable<
  Awaited<ReturnType<typeof buscarConteudo>>
>;
export type ModuloDoCurso = ConteudoDoCurso["modules"][number];
export type AulaDoCurso = ModuloDoCurso["lessons"][number];
