import { Prisma, type CourseLevel, type VideoProvider } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Leitura e escrita de cursos pelo painel do professor.
//
// A validação mora AQUI, e não no formulário: o formulário é conveniência de
// quem digita, mas quem garante que o banco não recebe um slug duplicado ou um
// vídeo pela metade é o servidor. O mesmo `validar` serve criação e edição.

export interface CourseInput {
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: CourseLevel | null;
  coverImageUrl: string | null;
  checkoutUrl: string | null;
  introVideoProvider: VideoProvider | null;
  introVideoExternalId: string | null;
}

/** erros por campo; vazio = pode gravar */
export type CourseErrors = Partial<Record<keyof CourseInput, string>>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "Improvisação e Modos Gregos" -> "improvisacao-e-modos-gregos"
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tira o acento das letras
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function urlValida(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validar(input: CourseInput): CourseErrors {
  const erros: CourseErrors = {};

  if (!input.title.trim()) {
    erros.title = "O título é obrigatório.";
  }

  if (!input.slug.trim()) {
    erros.slug = "O endereço é obrigatório.";
  } else if (!SLUG_RE.test(input.slug)) {
    erros.slug =
      "Use só letras minúsculas, números e hífen — sem acento nem espaço.";
  }

  if (input.coverImageUrl && !urlValida(input.coverImageUrl)) {
    erros.coverImageUrl = "Cole um endereço começando com http:// ou https://";
  }

  if (input.checkoutUrl && !urlValida(input.checkoutUrl)) {
    erros.checkoutUrl = "Cole um endereço começando com http:// ou https://";
  }

  // Meio preenchido é dado quebrado: a tela do curso monta a URL do player com
  // os dois campos, então ou vêm os dois ou não vem nenhum.
  if (input.introVideoProvider && !input.introVideoExternalId) {
    erros.introVideoExternalId =
      "Escolheu o serviço do vídeo — falta o código dele.";
  }
  if (!input.introVideoProvider && input.introVideoExternalId) {
    erros.introVideoProvider = "Escreveu o código — falta escolher o serviço.";
  }

  return erros;
}

export async function listarCursos() {
  const cursos = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modules: true, enrollments: true, products: true } },
      modules: { select: { _count: { select: { lessons: true } } } },
    },
  });

  return cursos.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    level: c.level,
    moduleCount: c._count.modules,
    enrollmentCount: c._count.enrollments,
    lessonCount: c.modules.reduce((n, m) => n + m._count.lessons, 0),
    temCheckout: Boolean(c.checkoutUrl),
    temIntro: Boolean(c.introVideoProvider && c.introVideoExternalId),
    // sem produto ligado, a compra chega e o webhook não sabe o que liberar
    temProduto: c._count.products > 0,
  }));
}

export type AdminCourseRow = Awaited<ReturnType<typeof listarCursos>>[number];

export async function buscarCurso(id: string) {
  return prisma.course.findUnique({ where: { id } });
}

// Prisma sinaliza violação de índice único com P2002. Traduzir aqui evita que
// a tela tenha que conhecer códigos de erro do banco — e um slug repetido é
// erro de preenchimento, não falha do sistema.
function erroDeSlugDuplicado(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2002" &&
    String(e.meta?.target ?? "").includes("slug")
  );
}

const SLUG_EM_USO = "Já existe um curso com este endereço.";

export async function criarCurso(
  input: CourseInput
): Promise<{ ok: true; id: string } | { ok: false; erros: CourseErrors }> {
  const erros = validar(input);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  try {
    const curso = await prisma.course.create({ data: input });
    return { ok: true, id: curso.id };
  } catch (e) {
    if (erroDeSlugDuplicado(e)) return { ok: false, erros: { slug: SLUG_EM_USO } };
    throw e;
  }
}

export async function atualizarCurso(
  id: string,
  input: CourseInput
): Promise<{ ok: true } | { ok: false; erros: CourseErrors }> {
  const erros = validar(input);
  if (Object.keys(erros).length > 0) return { ok: false, erros };

  try {
    await prisma.course.update({ where: { id }, data: input });
    return { ok: true };
  } catch (e) {
    if (erroDeSlugDuplicado(e)) return { ok: false, erros: { slug: SLUG_EM_USO } };
    throw e;
  }
}

/** categorias já usadas, pra sugerir no formulário em vez de reinventar */
export async function categoriasExistentes(): Promise<string[]> {
  const linhas = await prisma.course.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return linhas.map((l) => l.category as string);
}
