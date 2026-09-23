"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CourseLevel, VideoProvider } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import {
  atualizarCurso,
  criarCurso,
  type CourseErrors,
  type CourseInput,
} from "@/services/adminCourses";
import {
  atualizarAula,
  criarAula,
  criarModulo,
  criarProduto,
  excluirAula,
  excluirModulo,
  excluirProduto,
  lerDuracao,
  moverAula,
  moverModulo,
  renomearModulo,
  type LessonErrors,
  type LessonInput,
  type ProductErrors,
  type ProductInput,
} from "@/services/adminContent";

// Server Actions em vez de rotas de API + fetch no cliente.
//
// O resto do projeto usa rota de API (é assim que o login e o webhook
// funcionam), mas aqueles dois são API DE VERDADE: o webhook é chamado pela
// Hotmart e o login precisa devolver cookie. Um formulário interno não é
// contrato com ninguém de fora, e escrever rota + fetch + estado de erro à mão
// pra cada campo seria o dobro de código pra fazer o que o framework já faz.
//
// Toda ação revalida o papel de admin. Não basta o layout ter checado: Server
// Action é um endpoint HTTP como qualquer outro, e quem souber o caminho pode
// chamá-la sem nunca ter aberto a página.

export interface FormState {
  erros: CourseErrors;
  /** o que foi digitado, pra não perder o preenchimento quando dá erro */
  valores?: CourseInput;
}

function texto(fd: FormData, campo: string): string {
  return String(fd.get(campo) ?? "").trim();
}

/** string vazia do formulário vira null no banco */
function opcional(fd: FormData, campo: string): string | null {
  const v = texto(fd, campo);
  return v === "" ? null : v;
}

function lerFormulario(fd: FormData): CourseInput {
  return {
    title: texto(fd, "title"),
    slug: texto(fd, "slug"),
    description: opcional(fd, "description"),
    category: opcional(fd, "category"),
    level: (opcional(fd, "level") as CourseLevel | null) ?? null,
    coverImageUrl: opcional(fd, "coverImageUrl"),
    checkoutUrl: opcional(fd, "checkoutUrl"),
    introVideoProvider:
      (opcional(fd, "introVideoProvider") as VideoProvider | null) ?? null,
    introVideoExternalId: opcional(fd, "introVideoExternalId"),
  };
}

export async function salvarCurso(
  _anterior: FormState,
  fd: FormData
): Promise<FormState> {
  await requireAdmin();

  const id = texto(fd, "id");
  const input = lerFormulario(fd);

  const resultado = id
    ? await atualizarCurso(id, input)
    : await criarCurso(input);

  if (!resultado.ok) {
    return { erros: resultado.erros, valores: input };
  }

  // A área do aluno é force-dynamic, mas a landing é ISR (revalidate 600):
  // sem isto, um curso novo levaria até 10 minutos pra aparecer no site.
  revalidatePath("/", "layout");

  redirect(id ? `/admin/cursos/${id}?salvo=1` : "/admin?criado=1");
}

// ===========================================================================
// Conteúdo do curso: produtos da Hotmart, módulos e aulas
// ===========================================================================
//
// Cada ação revalida o admin pelo mesmo motivo de sempre: Server Action é um
// endpoint HTTP, e o layout ter checado não impede alguém de chamar direto.

/** contagem de aulas e duração aparecem na landing (ISR) e nos cards */
function revalidarCatalogo() {
  revalidatePath("/", "layout");
}

// --------------------------------------------------------------- produtos

export interface ProdutoState {
  erros: ProductErrors;
  valores?: ProductInput;
  /** o formulário de adicionar se limpa quando isto vem true */
  ok?: boolean;
}

export async function salvarProduto(
  _anterior: ProdutoState,
  fd: FormData
): Promise<ProdutoState> {
  await requireAdmin();

  const courseId = texto(fd, "courseId");
  const input: ProductInput = {
    hotmartProductId: texto(fd, "hotmartProductId"),
    hotmartOfferCode: opcional(fd, "hotmartOfferCode"),
  };

  const resultado = await criarProduto(courseId, input);
  if (!resultado.ok) return { erros: resultado.erros, valores: input };

  revalidarCatalogo();
  return { erros: {}, ok: true };
}

export async function removerProduto(fd: FormData): Promise<void> {
  await requireAdmin();
  await excluirProduto(texto(fd, "id"));
  revalidarCatalogo();
}

// ---------------------------------------------------------------- módulos

export interface ModuloState {
  erro?: string;
  ok?: boolean;
}

export async function salvarModulo(
  _anterior: ModuloState,
  fd: FormData
): Promise<ModuloState> {
  await requireAdmin();

  const id = texto(fd, "id");
  const title = texto(fd, "title");

  const resultado = id
    ? await renomearModulo(id, title)
    : await criarModulo(texto(fd, "courseId"), title);

  if (!resultado.ok) return { erro: resultado.erro };

  revalidarCatalogo();
  return { ok: true };
}

export async function removerModulo(fd: FormData): Promise<void> {
  await requireAdmin();
  await excluirModulo(texto(fd, "id"));
  revalidarCatalogo();
}

export async function reordenarModulo(fd: FormData): Promise<void> {
  await requireAdmin();
  const direcao = texto(fd, "direcao") === "cima" ? "cima" : "baixo";
  await moverModulo(texto(fd, "id"), direcao);
  revalidarCatalogo();
}

// ------------------------------------------------------------------ aulas

/** o que foi digitado, pra devolver ao formulário quando a validação recusa */
export interface AulaValores {
  title: string;
  videoProvider: string;
  videoExternalId: string;
  duracao: string;
}

export interface AulaState {
  erros: LessonErrors;
  valores?: AulaValores;
  ok?: boolean;
}

export async function salvarAula(
  _anterior: AulaState,
  fd: FormData
): Promise<AulaState> {
  await requireAdmin();

  const id = texto(fd, "id");
  const valores: AulaValores = {
    title: texto(fd, "title"),
    videoProvider: texto(fd, "videoProvider"),
    videoExternalId: texto(fd, "videoExternalId"),
    duracao: texto(fd, "duracao"),
  };

  const duracao = lerDuracao(valores.duracao);
  if (!duracao.ok) {
    return {
      erros: { durationSeconds: "Use o formato 24:19 (ou só os segundos)." },
      valores,
    };
  }

  const input: LessonInput = {
    title: valores.title,
    videoProvider: (valores.videoProvider || "YOUTUBE") as VideoProvider,
    videoExternalId: valores.videoExternalId,
    durationSeconds: duracao.segundos,
  };

  const resultado = id
    ? await atualizarAula(id, input)
    : await criarAula(texto(fd, "moduleId"), input);

  if (!resultado.ok) return { erros: resultado.erros, valores };

  revalidarCatalogo();
  return { erros: {}, ok: true };
}

export async function removerAula(fd: FormData): Promise<void> {
  await requireAdmin();
  await excluirAula(texto(fd, "id"));
  revalidarCatalogo();
}

export async function reordenarAula(fd: FormData): Promise<void> {
  await requireAdmin();
  const direcao = texto(fd, "direcao") === "cima" ? "cima" : "baixo";
  await moverAula(texto(fd, "id"), direcao);
  revalidarCatalogo();
}
