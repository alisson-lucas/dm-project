"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "first-access";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

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
    <main className="nf-auth">
      <div className="nf-auth-card">
        <div className="nf-auth-logo">CURSOS</div>
        <h1>{mode === "login" ? "Entrar" : "Primeiro acesso"}</h1>
        <p className="nf-auth-sub">
          {mode === "login"
            ? "Use seu e-mail e senha."
            : "Defina a senha da conta criada na sua compra."}
        </p>

        <form onSubmit={submit}>
          <input
            className="nf-field"
            type="email"
            required
            placeholder="e-mail"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="nf-field"
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

          {error ? <p className="nf-auth-error">{error}</p> : null}

          <button
            type="submit"
            className="nf-btn nf-btn-primary"
            disabled={busy}
          >
            {busy ? "..." : mode === "login" ? "Entrar" : "Definir senha"}
          </button>
        </form>

        <button
          type="button"
          className="nf-auth-switch"
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
