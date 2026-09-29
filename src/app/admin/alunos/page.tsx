import { listarAlunos, type AdminAluno } from "@/services/adminUsers";
import { LinkDeAcesso } from "@/components/admin/LinkDeAcesso";
import { plural } from "@/lib/format";

export const dynamic = "force-dynamic";

// Quem comprou, quem consegue entrar e quem está travado.
//
// "Travado" = tem curso liberado e não tem senha. No banco ele tem acesso; na
// prática não entra, porque nunca criou a senha. É o aluno que escreve
// dizendo "paguei e não consigo acessar", e a linha dele já vem com o botão
// que resolve.

function Etiqueta({ texto, tom }: { texto: string; tom: "alerta" | "calmo" }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[0.65rem] font-semibold ${
        tom === "alerta"
          ? "bg-[#43210f] text-[#ffab7d]"
          : "bg-white/[0.06] text-text-dim"
      }`}
    >
      {texto}
    </span>
  );
}

function Linha({ aluno }: { aluno: AdminAluno }) {
  return (
    <li className="border-b border-white/[0.06] px-4 py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="min-w-[220px] flex-1">
          <span className="block text-[0.92rem] font-semibold leading-tight">
            {aluno.name ?? "—"}
          </span>
          <span className="mt-0.5 block text-[0.78rem] text-text-faint">
            {aluno.email}
          </span>
        </span>

        <span className="flex flex-wrap items-center gap-2">
          {aluno.admin ? <Etiqueta texto="admin" tom="calmo" /> : null}
          {aluno.travado ? (
            <Etiqueta texto="comprou e não consegue entrar" tom="alerta" />
          ) : null}
          {!aluno.temSenha && !aluno.travado ? (
            <Etiqueta texto="sem senha" tom="calmo" />
          ) : null}
          {aluno.pendentes > 0 ? (
            <Etiqueta
              texto={`${plural(aluno.pendentes, "compra")} pendente${aluno.pendentes === 1 ? "" : "s"}`}
              tom="calmo"
            />
          ) : null}
        </span>

        <span className="w-[230px] text-[0.78rem] text-text-dim">
          {aluno.cursos.length > 0 ? aluno.cursos.join(", ") : "sem curso ativo"}
        </span>

        <LinkDeAcesso userId={aluno.id} temSenha={aluno.temSenha} />
      </div>
    </li>
  );
}

export default async function AlunosPage() {
  const alunos = await listarAlunos();
  const travados = alunos.filter((a) => a.travado).length;

  return (
    <>
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.025em]">
        Alunos
      </h1>
      <p className="mb-7 mt-1.5 text-[0.9rem] text-text-dim">
        {plural(alunos.length, "conta")} no total
        {travados > 0
          ? ` · ${travados} comprou e não consegue entrar`
          : ""}
        .
      </p>

      {alunos.length === 0 ? (
        <p className="rounded-xl border border-white/8 bg-surface px-5 py-8 text-center text-[0.9rem] text-text-dim">
          Nenhuma conta ainda.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-white/8 bg-bg-2/60">
          {alunos.map((a) => (
            <Linha key={a.id} aluno={a} />
          ))}
        </ul>
      )}
    </>
  );
}
