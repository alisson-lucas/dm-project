import Link from "next/link";
import { listarCursos, type AdminCourseRow } from "@/services/adminCourses";
import { courseLevelLabel, plural } from "@/lib/format";
import { btnPrimary } from "@/lib/ui";

export const dynamic = "force-dynamic";

// Lista de cursos do painel.
//
// Além do nome, ela mostra o que IMPEDE cada curso de funcionar: sem aula o
// aluno abre a tela e não tem o que assistir; sem produto da Hotmart ligado a
// compra chega e nada é liberado; sem link de compra o botão de comprar fica
// inerte. São as três coisas que mais travam um lançamento, e descobrir isso
// abrindo curso por curso é como se perde uma tarde.

function Pendencia({ texto }: { texto: string }) {
  return (
    <span className="rounded bg-[#43210f] px-2 py-0.5 text-[0.65rem] font-semibold text-[#ffab7d]">
      {texto}
    </span>
  );
}

function Linha({ curso }: { curso: AdminCourseRow }) {
  const nivel = courseLevelLabel(curso.level);

  return (
    <li>
      <Link
        href={`/admin/cursos/${curso.id}`}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.06] px-4 py-4 transition-colors hover:bg-white/[0.04]"
      >
        <span className="min-w-[220px] flex-1">
          <span className="block font-semibold leading-tight">
            {curso.title}
          </span>
          <span className="mt-1 block text-[0.75rem] text-text-faint">
            /{curso.slug}
          </span>
        </span>

        <span className="flex flex-wrap items-center gap-2">
          {curso.lessonCount === 0 ? (
            <Pendencia texto="sem aulas" />
          ) : null}
          {!curso.temProduto ? (
            <Pendencia texto="não libera na compra" />
          ) : null}
          {!curso.temCheckout ? <Pendencia texto="sem link de compra" /> : null}
        </span>

        <span className="w-[150px] text-[0.78rem] text-text-dim">
          {[curso.category, nivel].filter(Boolean).join(" · ") || "—"}
        </span>

        <span className="w-[120px] tabular-nums text-[0.78rem] text-text-faint">
          {plural(curso.lessonCount, "aula")}
        </span>

        <span className="w-[110px] tabular-nums text-[0.78rem] text-text-faint">
          {plural(curso.enrollmentCount, "aluno")}
        </span>
      </Link>
    </li>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ criado?: string }>;
}) {
  const { criado } = await searchParams;
  const cursos = await listarCursos();

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.025em]">
            Cursos
          </h1>
          <p className="mt-1.5 text-[0.9rem] text-text-dim">
            {plural(cursos.length, "curso")} no catálogo.
          </p>
        </div>

        <Link href="/admin/cursos/novo" className={btnPrimary}>
          Novo curso
        </Link>
      </div>

      {criado ? (
        <p className="mb-6 rounded-lg border border-[#1f6b57] bg-[#0e2b24] px-4 py-3 text-[0.88rem] text-[#8ae0c6]">
          Curso criado.
        </p>
      ) : null}

      {cursos.length === 0 ? (
        <p className="rounded-xl border border-white/8 bg-surface px-5 py-8 text-center text-[0.9rem] text-text-dim">
          Nenhum curso cadastrado ainda.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-white/8 bg-bg-2/60">
          {cursos.map((curso) => (
            <Linha key={curso.id} curso={curso} />
          ))}
        </ul>
      )}
    </>
  );
}
