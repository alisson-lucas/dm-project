"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { btnPrimary } from "../../lib/ui";
import { Logo } from "../../components/Logo";

// "recuperar" cobre os dois casos que levam ao mesmo lugar: quem comprou e
// nunca criou senha, e quem esqueceu a dela. Nos dois, a saída é um link de uso
// único por e-mail — a tela não precisa saber qual é qual, e o servidor decide.
type Mode = "login" | "recuperar";

const field =
  "w-full mb-3 rounded-lg border border-white/8 bg-[#0f0f13] px-3.5 py-3 " +
  "text-[0.95rem] text-text focus:border-accent focus:outline-none";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/app";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (mode === "recuperar") {
      await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setBusy(false);
      // Confirmação igual exista ou não a conta: a rota também responde ok
      // sempre, pra esta tela não virar um verificador de quem é aluno.
      setEnviado(true);
      return;
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setBusy(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "não foi possível continuar");
      return;
    }

    router.push(next);
    router.refresh();
  }

  function trocarModo(m: Mode) {
    setMode(m);
    setError(null);
    setEnviado(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(158,34,76,0.28),transparent_70%)]">
      <div className="relative w-full max-w-95 rounded-[14px] border border-white/8 bg-[rgba(20,20,26,0.86)] px-8 py-9 backdrop-blur-sm">
        <Logo className="mb-5.5 text-accent-2" markClassName="h-9 w-9" />

        {enviado ? (
          <>
            <h1 className="mb-1 text-[1.5rem] font-bold">Confira seu e-mail</h1>
            <p className="mb-5.5 text-[0.9rem] leading-[1.6] text-text-dim">
              Se existir uma conta com <strong className="text-text">{email}</strong>,
              acabamos de mandar um link para criar a senha. Ele vale por algumas
              horas e só pode ser usado uma vez.
            </p>
            <button
              type="button"
              className="cursor-pointer p-0 text-[0.82rem] text-text-dim hover:text-text"
              onClick={() => trocarModo("login")}
            >
              Voltar para a entrada
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-[1.5rem] font-bold">
              {mode === "login" ? "Entrar" : "Receber link de acesso"}
            </h1>
            <p className="mb-5.5 text-[0.9rem] leading-[1.6] text-text-dim">
              {mode === "login"
                ? "Use seu e-mail e senha."
                : "Comprou e ainda não criou senha, ou esqueceu a sua? Mandamos um link para o e-mail da compra."}
            </p>

            <form onSubmit={submit}>
              <input
                className={field}
                type="email"
                required
                placeholder="e-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {mode === "login" ? (
                <input
                  className={field}
                  type="password"
                  required
                  placeholder="senha"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              ) : null}

              {error ? (
                <p className="mb-2.5 text-[0.82rem] text-[#ff8ba7]">{error}</p>
              ) : null}

              <button
                type="submit"
                className={`${btnPrimary} mt-1 w-full justify-center py-3!`}
                disabled={busy}
              >
                {busy ? "..." : mode === "login" ? "Entrar" : "Enviar link"}
              </button>
            </form>

            <button
              type="button"
              className="mt-4 cursor-pointer p-0 text-[0.82rem] text-text-dim hover:text-text"
              onClick={() => trocarModo(mode === "login" ? "recuperar" : "login")}
            >
              {mode === "login"
                ? "Primeiro acesso ou esqueci a senha"
                : "Já tenho senha — entrar"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
