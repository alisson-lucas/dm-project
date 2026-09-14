import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarCurso, categoriasExistentes } from "@/services/adminCourses";
import { CourseForm } from "@/components/admin/CourseForm";

export const dynamic = "force-dynamic";

export default async function EditarCursoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { id } = await params;
  const { salvo } = await searchParams;

  const [curso, categorias] = await Promise.all([
    buscarCurso(id),
    categoriasExistentes(),
  ]);

  if (!curso) notFound();

  return (
    <>
      <Link
        href="/admin"
        className="text-[0.85rem] text-text-dim transition-colors hover:text-text"
      >
        ← Cursos
      </Link>

      <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-[1.1] tracking-[-0.025em]">
            {curso.title}
          </h1>
          <p className="mt-1.5 text-[0.85rem] text-text-faint">/{curso.slug}</p>
        </div>

        <Link
          href={`/app/courses/${curso.slug}`}
          className="text-[0.85rem] text-accent-2 transition-colors hover:text-text"
        >
          Ver a tela do aluno →
        </Link>
      </div>

      {salvo ? (
        <p className="mb-6 rounded-lg border border-[#1f6b57] bg-[#0e2b24] px-4 py-3 text-[0.88rem] text-[#8ae0c6]">
          Alterações salvas.
        </p>
      ) : null}

      <CourseForm curso={curso} categorias={categorias} />
    </>
  );
}
