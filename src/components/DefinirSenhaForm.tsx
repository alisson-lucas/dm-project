"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "./Logo";
import { btnPrimary } from "@/lib/ui";

const campo =
  "w-full mb-3 rounded-lg border border-white/8 bg-[#0f0f13] px-3.5 py-3 " +
  "text-[0.95rem] text-text focus:border-accent focus:outline-none";

export function DefinirSenhaForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Conferir aqui é conveniência: errar a senha na digitação e só descobrir
    // depois de queimar o link de uso único seria cruel.
    if (senha !== confirma) {
      setErro("As duas senhas não são iguais.");
      return;
    }

    setEnviando(true);
    setErro(null);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: senha }),
    });

    setEnviando(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErro(body.error ?? "Não foi possível definir a senha.");
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(158,34,76,0.28),transparent_70%)]">
      <div className="relative w-full max-w-95 rounded-[14px] border border-white/8 bg-[rgba(20,20,26,0.86)] px-8 py-9 backdrop-blur-sm">
        <Logo className="mb-5.5 text-accent-2" markClassName="h-9 w-9" />

        {!token ? (
          <>
            <h1 className="mb-1 text-[1.5rem] font-bold">Link incompleto</h1>
            <p className="text-[0.9rem] leading-[1.6] text-text-dim">
              Abra o link direto do e-mail que você recebeu. Se ele não chegou,
              peça outro na{" "}
              <Link href="/login" className="text-accent-2 hover:text-text">
                tela de entrada
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-[1.5rem] font-bold">Criar sua senha</h1>
            <p className="mb-5.5 text-[0.9rem] text-text-dim">
              Escolha uma senha de pelo menos 8 caracteres.
            </p>

            <form onSubmit={submit}>
              <input
                className={campo}
                type="password"
                required
                minLength={8}
                placeholder="nova senha (mín. 8)"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <input
                className={campo}
                type="password"
                required
                minLength={8}
                placeholder="repita a senha"
                autoComplete="new-password"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
              />

              {erro ? (
                <p className="mb-2.5 text-[0.82rem] text-[#ff8ba7]">{erro}</p>
              ) : null}

              <button
                type="submit"
                disabled={enviando}
                className={`${btnPrimary} mt-1 w-full justify-center py-3!`}
              >
                {enviando ? "..." : "Criar senha e entrar"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
