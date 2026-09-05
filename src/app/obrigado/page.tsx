import type { Metadata } from "next";
import Link from "next/link";
import { TEACHER } from "@/lib/site";
import { Logo } from "@/components/Logo";
import { btnGhost, btnPrimary } from "@/lib/ui";

// Página de destino pós-compra (configure ela como redirect de obrigado na
// Hotmart). Existe pra explicar o passo que o fluxo atual não explica em lugar
// nenhum: a conta é criada pelo webhook SEM senha, e o aluno precisa usar
// "Primeiro acesso" pra definir a dele.
export const metadata: Metadata = {
  title: "Compra confirmada",
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    n: "1",
    title: "Aguarde a confirmação do pagamento",
    body: "Cartão costuma ser na hora. Boleto e Pix podem levar alguns minutos até a Hotmart confirmar.",
  },
  {
    n: "2",
    title: "Defina sua senha",
    body: "Na tela de login, clique em “Primeiro acesso? Definir senha” e use o mesmo e-mail que você usou na compra.",
  },
  {
    n: "3",
    title: "Comece pela primeira aula",
    body: "Seus cursos já aparecem liberados. A plataforma guarda onde você parou e te devolve ali na próxima vez.",
  },
];

export default function ObrigadoPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-[clamp(16px,4vw,48px)] py-[clamp(56px,9vw,110px)]">
      <Logo className="text-accent-2" markClassName="h-9 w-9" />

      <h1 className="mt-3.5 text-[clamp(1.9rem,4.5vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
        Compra confirmada. Bem-vindo!
      </h1>

      <p className="mt-4 max-w-[52ch] text-[0.98rem] leading-[1.65] text-text-dim">
        Seu acesso é liberado automaticamente. Só faltam três passos para você
        começar a assistir.
      </p>

      <ol className="mt-9 flex flex-col gap-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="flex gap-4 rounded-xl border border-white/8 bg-surface p-5"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-accent text-[0.78rem] font-bold text-white">
              {s.n}
            </span>
            <div>
              <h2 className="text-[0.95rem] font-bold">{s.title}</h2>
              <p className="mt-1.5 text-[0.86rem] leading-[1.6] text-text-dim">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-9 flex flex-wrap items-center gap-3.5">
        <Link href="/login" className={btnPrimary}>
          Definir minha senha
        </Link>
        <Link href="/" className={btnGhost}>
          Voltar ao início
        </Link>
      </div>

      <p className="mt-8 text-[0.8rem] leading-[1.6] text-text-faint">
        Não conseguiu entrar? Confira se está usando o mesmo e-mail da compra.
        Se o problema continuar, responda o e-mail da Hotmart que a gente
        resolve. — {TEACHER.name}
      </p>
    </main>
  );
}
