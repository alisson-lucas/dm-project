"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import type { Course } from "@prisma/client";
import { salvarCurso, type FormState } from "@/app/admin/actions";
import { slugify } from "@/services/adminCourses";
import { btnGhost, btnPrimary } from "@/lib/ui";

// Formulário de curso — serve pra criar e pra editar. A diferença é só o campo
// `id` escondido: com ele a ação atualiza, sem ele cria.
//
// O estado vem do `useActionState`: quando a validação do servidor recusa, a
// ação devolve os erros POR CAMPO e os valores digitados, então a tela remonta
// exatamente como estava em vez de limpar o que a pessoa escreveu.

const campo =
  "w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3.5 py-2.5 " +
  "text-[0.92rem] text-text placeholder:text-text-faint/70 " +
  "focus:border-accent-2 focus:outline-none";

const NIVEIS = [
  { valor: "", rotulo: "Sem nível definido" },
  { valor: "BEGINNER", rotulo: "Iniciante" },
  { valor: "INTERMEDIATE", rotulo: "Intermediário" },
  { valor: "ADVANCED", rotulo: "Avançado" },
];

const SERVICOS = [
  { valor: "", rotulo: "Sem vídeo de apresentação" },
  { valor: "YOUTUBE", rotulo: "YouTube" },
  { valor: "VIMEO", rotulo: "Vimeo" },
  { valor: "PANDA", rotulo: "Panda Video" },
];

function Campo({
  label,
  ajuda,
  erro,
  children,
}: {
  label: string;
  ajuda?: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-semibold">{label}</span>
      {children}
      {erro ? (
        <span className="mt-1.5 block text-[0.78rem] text-[#ff8a6b]">{erro}</span>
      ) : ajuda ? (
        <span className="mt-1.5 block text-[0.76rem] text-text-faint">
          {ajuda}
        </span>
      ) : null}
    </label>
  );
}

export function CourseForm({
  curso,
  categorias,
}: {
  /** ausente = criando um curso novo */
  curso?: Course;
  categorias: string[];
}) {
  const [estado, formAction, enviando] = useActionState<FormState, FormData>(
    salvarCurso,
    { erros: {} }
  );

  const listaId = useId();
  const v = estado.valores;

  // O endereço nasce do título, mas para de seguir assim que alguém o edita na
  // mão: curso já publicado não pode ter a URL trocada por baixo dos panos só
  // porque o título ganhou uma vírgula.
  const [slug, setSlug] = useState(v?.slug ?? curso?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(curso?.slug));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {curso ? <input type="hidden" name="id" value={curso.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Campo label="Título do curso" erro={estado.erros.title}>
            <input
              name="title"
              required
              defaultValue={v?.title ?? curso?.title ?? ""}
              onChange={(e) => {
                if (!slugManual) setSlug(slugify(e.target.value));
              }}
              placeholder="Improvisação e Modos Gregos"
              className={campo}
            />
          </Campo>
        </div>

        <div className="sm:col-span-2">
          <Campo
            label="Endereço do curso"
            ajuda={`Como o curso aparece no link: /app/courses/${slug || "…"}`}
            erro={estado.erros.slug}
          >
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="improvisacao-e-modos-gregos"
              className={campo}
            />
          </Campo>
        </div>

        <div className="sm:col-span-2">
          <Campo
            label="Descrição"
            ajuda="Aparece embaixo do título, na tela do curso e nos cards."
            erro={estado.erros.description}
          >
            <textarea
              name="description"
              rows={3}
              defaultValue={v?.description ?? curso?.description ?? ""}
              className={`${campo} resize-y`}
            />
          </Campo>
        </div>

        <Campo
          label="Estilo"
          ajuda="Vira filtro na tela Explorar."
          erro={estado.erros.category}
        >
          <input
            name="category"
            list={listaId}
            defaultValue={v?.category ?? curso?.category ?? ""}
            placeholder="Blues"
            className={campo}
          />
          <datalist id={listaId}>
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Campo>

        <Campo label="Nível" erro={estado.erros.level}>
          <select
            name="level"
            defaultValue={v?.level ?? curso?.level ?? ""}
            className={campo}
          >
            {NIVEIS.map((n) => (
              <option key={n.valor} value={n.valor}>
                {n.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <div className="sm:col-span-2">
          <Campo
            label="Capa"
            ajuda="Endereço da imagem. Em branco, o curso usa a capa padrão da marca."
            erro={estado.erros.coverImageUrl}
          >
            <input
              name="coverImageUrl"
              defaultValue={v?.coverImageUrl ?? curso?.coverImageUrl ?? ""}
              placeholder="https://"
              className={campo}
            />
          </Campo>
        </div>

        <div className="sm:col-span-2">
          <Campo
            label="Link de compra na Hotmart"
            ajuda="Sem ele o botão “Comprar curso” fica inerte e ninguém consegue comprar."
            erro={estado.erros.checkoutUrl}
          >
            <input
              name="checkoutUrl"
              defaultValue={v?.checkoutUrl ?? curso?.checkoutUrl ?? ""}
              placeholder="https://pay.hotmart.com/..."
              className={campo}
            />
          </Campo>
        </div>

        <Campo
          label="Vídeo de apresentação"
          erro={estado.erros.introVideoProvider}
        >
          <select
            name="introVideoProvider"
            defaultValue={v?.introVideoProvider ?? curso?.introVideoProvider ?? ""}
            className={campo}
          >
            {SERVICOS.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          label="Código do vídeo"
          ajuda="No YouTube é o que vem depois de v= no endereço."
          erro={estado.erros.introVideoExternalId}
        >
          <input
            name="introVideoExternalId"
            defaultValue={
              v?.introVideoExternalId ?? curso?.introVideoExternalId ?? ""
            }
            placeholder="wn0NLjZj9Fc"
            className={campo}
          />
        </Campo>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/8 pt-5">
        <button type="submit" disabled={enviando} className={btnPrimary}>
          {enviando ? "Salvando…" : curso ? "Salvar alterações" : "Criar curso"}
        </button>
        <Link href="/admin" className={btnGhost}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
