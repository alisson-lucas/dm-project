"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { btnPrimary } from "../../lib/ui";
import { SITE_NAME } from "../../lib/site";

type Mode = "login" | "first-access";

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
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/set-password";
    const res = await fetch(endpoint, {
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(158,34,76,0.28),transparent_70%)]">
      <div className="relative w-full max-w-95 rounded-[14px] border border-white/8 bg-[rgba(20,20,26,0.86)] px-8 py-9 backdrop-blur-sm">
        <div className="mb-5.5 text-[1.1rem] font-extrabold tracking-[0.2em] text-accent-2">
          {SITE_NAME}
        </div>
        <h1 className="mb-1 text-[1.5rem] font-bold">
          {mode === "login" ? "Entrar" : "Primeiro acesso"}
        </h1>
        <p className="mb-5.5 text-[0.9rem] text-text-dim">
          {mode === "login"
            ? "Use seu e-mail e senha."
            : "Defina a senha da conta criada na sua compra."}
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
          <input
            className={field}
            type="password"
            required
            minLength={mode === "first-access" ? 8 : undefined}
            placeholder={
              mode === "first-access" ? "nova senha (mín. 8)" : "senha"
            }
            autoComplete={
              mode === "first-access" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? (
            <p className="mb-2.5 text-[0.82rem] text-[#ff8ba7]">{error}</p>
          ) : null}

          <button
            type="submit"
            className={`${btnPrimary} mt-1 w-full justify-center py-3!`}
            disabled={busy}
          >
            {busy ? "..." : mode === "login" ? "Entrar" : "Definir senha"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 cursor-pointer p-0 text-[0.82rem] text-text-dim hover:text-text"
          onClick={() => {
            setMode(mode === "login" ? "first-access" : "login");
            setError(null);
          }}
        >
          {mode === "login"
            ? "Primeiro acesso? Definir senha"
            : "Já tenho senha — entrar"}
        </button>
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
