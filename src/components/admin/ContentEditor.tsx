"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  removerAula,
  removerModulo,
  reordenarAula,
  reordenarModulo,
  salvarAula,
  salvarModulo,
  type AulaState,
  type ModuloState,
} from "@/app/admin/actions";
import type { AulaDoCurso, ModuloDoCurso } from "@/services/adminContent";
import { formatClock, plural } from "@/lib/format";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { Campo, Pendencia, SERVICOS_VIDEO, acaoPerigo, acaoSutil, campo } from "./fields";

// Módulos e aulas do curso.
//
// Tudo é Server Action em formulário: mover, excluir e salvar não guardam
// estado no cliente, então a lista sempre reflete o banco depois do envio. O
// `useState` daqui só decide qual formulário está ABERTO — nada de dado.

// --------------------------------------------------------------------- aulas

function FormularioAula({
  moduleId,
  aula,
  aoFechar,
}: {
  /** obrigatório ao criar */
  moduleId?: string;
  /** presente = editando */
  aula?: AulaDoCurso;
  aoFechar: () => void;
}) {
  const [estado, formAction, enviando] = useActionState<AulaState, FormData>(
    salvarAula,
    { erros: {} }
  );

  useEffect(() => {
    if (estado.ok) aoFechar();
  }, [estado, aoFechar]);

  const v = estado.valores;

  return (
    <form
      action={formAction}
      className="border-t border-white/[0.06] bg-[#101014] px-4 py-4"
    >
      {aula ? <input type="hidden" name="id" value={aula.id} /> : null}
      {moduleId ? <input type="hidden" name="moduleId" value={moduleId} /> : null}

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="sm:col-span-2">
          <Campo label="Título da aula" erro={estado.erros.title}>
            <input
              name="title"
              required
              autoFocus
              defaultValue={v?.title ?? aula?.title ?? ""}
              placeholder="Como improvisar utilizando o modo dórico"
              className={campo}
            />
          </Campo>
        </div>

        <Campo label="Onde está o vídeo" erro={estado.erros.videoProvider}>
          <select
            name="videoProvider"
            defaultValue={v?.videoProvider ?? aula?.videoProvider ?? "YOUTUBE"}
            className={campo}
          >
            {SERVICOS_VIDEO.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          label="Duração"
          ajuda="Formato 24:19. Em branco, a aula fica sem tempo."
          erro={estado.erros.durationSeconds}
        >
          <input
            name="duracao"
            defaultValue={v?.duracao ?? formatClock(aula?.durationSeconds) ?? ""}
            placeholder="24:19"
            className={campo}
          />
        </Campo>

        <div className="sm:col-span-2">
          <Campo
            label="Código do vídeo"
            ajuda="No YouTube é o que vem depois de v= no endereço. Nunca cole a URL inteira."
            erro={estado.erros.videoExternalId}
          >
            <input
              name="videoExternalId"
              required
              defaultValue={v?.videoExternalId ?? aula?.videoExternalId ?? ""}
              placeholder="wn0NLjZj9Fc"
              className={campo}
            />
          </Campo>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" disabled={enviando} className={btnPrimary}>
          {enviando ? "Salvando…" : aula ? "Salvar aula" : "Adicionar aula"}
        </button>
        <button type="button" onClick={aoFechar} className={btnGhost}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function LinhaAula({
  aula,
  numero,
  primeira,
  ultima,
  editando,
  aoEditar,
  aoFechar,
}: {
  aula: AulaDoCurso;
  numero: number;
  primeira: boolean;
  ultima: boolean;
  editando: boolean;
  aoEditar: () => void;
  aoFechar: () => void;
}) {
  if (editando) {
    return (
      <li>
        <FormularioAula aula={aula} aoFechar={aoFechar} />
      </li>
    );
  }

  const duracao = formatClock(aula.durationSeconds);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.06] px-4 py-2.5">
      <span className="w-5 shrink-0 text-right text-[0.75rem] tabular-nums text-text-faint">
        {numero}
      </span>

      <span className="min-w-[160px] flex-1 text-[0.88rem]">{aula.title}</span>

      <span className="text-[0.72rem] uppercase tracking-[0.08em] text-text-faint">
        {aula.videoProvider}
      </span>

      <span className="w-14 text-right text-[0.75rem] tabular-nums text-text-faint">
        {duracao ?? "—"}
      </span>

      <span className="flex items-center gap-1.5">
        <form action={reordenarAula}>
          <input type="hidden" name="id" value={aula.id} />
          <input type="hidden" name="direcao" value="cima" />
          <button
            type="submit"
            disabled={primeira}
            aria-label="Subir aula"
            className={acaoSutil}
          >
            ↑
          </button>
        </form>
        <form action={reordenarAula}>
          <input type="hidden" name="id" value={aula.id} />
          <input type="hidden" name="direcao" value="baixo" />
          <button
            type="submit"
            disabled={ultima}
            aria-label="Descer aula"
            className={acaoSutil}
          >
            ↓
          </button>
        </form>

        <button type="button" onClick={aoEditar} className={acaoSutil}>
          Editar
        </button>

        <form
          action={removerAula}
          onSubmit={(e) => {
            if (!confirm(`Excluir a aula "${aula.title}"?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={aula.id} />
          <button type="submit" className={acaoPerigo}>
            Excluir
          </button>
        </form>
      </span>
    </li>
  );
}

// ------------------------------------------------------------------- módulos

function CabecalhoModulo({
  modulo,
  numero,
  primeiro,
  ultimo,
}: {
  modulo: ModuloDoCurso;
  numero: number;
  primeiro: boolean;
  ultimo: boolean;
}) {
  const [renomeando, setRenomeando] = useState(false);
  const [estado, formAction, enviando] = useActionState<ModuloState, FormData>(
    salvarModulo,
    {}
  );

  useEffect(() => {
    if (estado.ok) setRenomeando(false);
  }, [estado]);

  if (renomeando) {
    return (
      <form action={formAction} className="flex flex-wrap items-start gap-3 px-4 py-3">
        <input type="hidden" name="id" value={modulo.id} />
        <div className="min-w-[220px] flex-1">
          <input
            name="title"
            required
            autoFocus
            defaultValue={modulo.title}
            className={campo}
          />
          {estado.erro ? (
            <span className="mt-1.5 block text-[0.78rem] text-[#ff8a6b]">
              {estado.erro}
            </span>
          ) : null}
        </div>
        <button type="submit" disabled={enviando} className={btnPrimary}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setRenomeando(false)}
          className={btnGhost}
        >
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[0.7rem] font-bold tabular-nums text-text-faint">
        {String(numero).padStart(2, "0")}
      </span>

      <span className="min-w-[160px] flex-1 font-semibold">{modulo.title}</span>

      <span className="text-[0.75rem] text-text-faint">
        {plural(modulo.lessons.length, "aula")}
      </span>

      <span className="flex items-center gap-1.5">
        <form action={reordenarModulo}>
          <input type="hidden" name="id" value={modulo.id} />
          <input type="hidden" name="direcao" value="cima" />
          <button
            type="submit"
            disabled={primeiro}
            aria-label="Subir módulo"
            className={acaoSutil}
          >
            ↑
          </button>
        </form>
        <form action={reordenarModulo}>
          <input type="hidden" name="id" value={modulo.id} />
          <input type="hidden" name="direcao" value="baixo" />
          <button
            type="submit"
            disabled={ultimo}
            aria-label="Descer módulo"
            className={acaoSutil}
          >
            ↓
          </button>
        </form>

        <button
          type="button"
          onClick={() => setRenomeando(true)}
          className={acaoSutil}
        >
          Renomear
        </button>

        <form
          action={removerModulo}
          onSubmit={(e) => {
            const aviso =
              modulo.lessons.length > 0
                ? `Excluir o módulo "${modulo.title}" e as ${modulo.lessons.length} aulas dele?`
                : `Excluir o módulo "${modulo.title}"?`;
            if (!confirm(aviso)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={modulo.id} />
          <button type="submit" className={acaoPerigo}>
            Excluir
          </button>
        </form>
      </span>
    </div>
  );
}

function BlocoModulo({
  modulo,
  numero,
  primeiro,
  ultimo,
}: {
  modulo: ModuloDoCurso;
  numero: number;
  primeiro: boolean;
  ultimo: boolean;
}) {
  const [adicionando, setAdicionando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-bg-2/60">
      <CabecalhoModulo
        modulo={modulo}
        numero={numero}
        primeiro={primeiro}
        ultimo={ultimo}
      />

      {modulo.lessons.length > 0 ? (
        <ul>
          {modulo.lessons.map((aula, i) => (
            <LinhaAula
              key={aula.id}
              aula={aula}
              numero={i + 1}
              primeira={i === 0}
              ultima={i === modulo.lessons.length - 1}
              editando={editandoId === aula.id}
              aoEditar={() => setEditandoId(aula.id)}
              aoFechar={() => setEditandoId(null)}
            />
          ))}
        </ul>
      ) : (
        <p className="border-t border-white/[0.06] px-4 py-3 text-[0.8rem] text-text-faint">
          Módulo sem aulas.
        </p>
      )}

      {adicionando ? (
        <FormularioAula
          moduleId={modulo.id}
          aoFechar={() => setAdicionando(false)}
        />
      ) : (
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="text-[0.82rem] text-accent-2 transition-colors hover:text-text"
          >
            + Adicionar aula
          </button>
        </div>
      )}
    </div>
  );
}

function FormularioModulo({ courseId }: { courseId: string }) {
  const [estado, formAction, enviando] = useActionState<ModuloState, FormData>(
    salvarModulo,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-start gap-3"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <div className="min-w-[220px] flex-1">
        <input
          name="title"
          required
          placeholder="Nome do módulo — ex: Pentatônica na prática"
          className={campo}
        />
        {estado.erro ? (
          <span className="mt-1.5 block text-[0.78rem] text-[#ff8a6b]">
            {estado.erro}
          </span>
        ) : null}
      </div>
      <button type="submit" disabled={enviando} className={btnPrimary}>
        {enviando ? "Criando…" : "Adicionar módulo"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------

export function ContentEditor({
  courseId,
  modulos,
}: {
  courseId: string;
  modulos: ModuloDoCurso[];
}) {
  const totalAulas = modulos.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <section className="mt-12">
      <h2 className="text-[1.05rem] font-bold">Conteúdo do curso</h2>
      <p className="mt-1.5 max-w-[70ch] text-[0.85rem] leading-[1.6] text-text-dim">
        Os módulos e as aulas na ordem em que o aluno vê. A ordem aqui é a
        mesma da tela do curso e do “continue de onde parou”.
      </p>

      {totalAulas === 0 ? (
        <div className="mt-4">
          <Pendencia>
            Curso sem nenhuma aula. Ele aparece no catálogo, mas quem abrir vê o
            aviso de que o conteúdo ainda está sendo publicado.
          </Pendencia>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        {modulos.map((modulo, i) => (
          <BlocoModulo
            key={modulo.id}
            modulo={modulo}
            numero={i + 1}
            primeiro={i === 0}
            ultimo={i === modulos.length - 1}
          />
        ))}
      </div>

      <div className="mt-4">
        <FormularioModulo courseId={courseId} />
      </div>
    </section>
  );
}
