import Link from "next/link";
import { categoriasExistentes } from "@/services/adminCourses";
import { CourseForm } from "@/components/admin/CourseForm";

export const dynamic = "force-dynamic";

export default async function NovoCursoPage() {
  const categorias = await categoriasExistentes();

  return (
    <>
      <Link
        href="/admin"
        className="text-[0.85rem] text-text-dim transition-colors hover:text-text"
      >
        ← Cursos
      </Link>

      <h1 className="mb-1.5 mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.025em]">
        Novo curso
      </h1>
      <p className="mb-8 max-w-[60ch] text-[0.9rem] text-text-dim">
        Salve a ficha primeiro. Na tela seguinte você liga o produto da Hotmart
        (é o que libera o acesso de quem compra) e cadastra os módulos e as
        aulas.
      </p>

      <CourseForm categorias={categorias} />
    </>
  );
}
