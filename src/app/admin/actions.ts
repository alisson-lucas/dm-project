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
