"use client";

import { useActionState, useState } from "react";
import { gerarLinkDeAcesso, type LinkState } from "@/app/admin/actions";

// Botão que gera um link de acesso para um aluno, pra mandar por WhatsApp
// quando o e-mail não chegou (ou quando o provedor ainda não está de pé).
//
// O link é mostrado na tela porque é pra ser copiado — mas ele É a credencial,
// e o aviso vermelho existe pra que ninguém cole isso num grupo achando que é
// só "o endereço do curso".

export function LinkDeAcesso({
  userId,
  temSenha,
}: {
  userId: string;
  temSenha: boolean;
}) {
  const [estado, formAction, gerando] = useActionState<LinkState, FormData>(
    gerarLinkDeAcesso,
    {}
  );
  const [copiado, setCopiado] = useState(false);

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard bloqueado (contexto sem permissão): o link segue à vista
      // e selecionável, então a pessoa copia na mão
      return;
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  if (estado.url) {
    return (
      <div className="w-full">
        <p className="mb-1.5 text-[0.72rem] font-semibold text-[#ffab7d]">
          Este link entra na conta do aluno. Mande só para ele.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={estado.url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2 font-mono text-[0.75rem] text-text"
          />
          <button
            type="button"
            onClick={() => copiar(estado.url as string)}
            className="rounded-lg border border-white/10 px-3 py-2 text-[0.75rem] font-semibold transition-colors hover:border-accent-2 hover:text-accent-2"
          >
            {copiado ? "copiado" : "copiar"}
          </button>
        </div>

        <p className="mt-1.5 text-[0.72rem] text-text-faint">
          {estado.redefinicao
            ? "O aluno já tinha senha — este link troca a senha dele."
            : "Primeiro acesso."}{" "}
          Vale até {estado.expiraEm}, uma vez só.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={gerando}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-[0.75rem] font-semibold text-text-dim transition-colors hover:border-accent-2 hover:text-accent-2 disabled:opacity-50"
      >
        {gerando
          ? "gerando…"
          : temSenha
            ? "Gerar link de nova senha"
            : "Gerar link de acesso"}
      </button>
      {estado.erro ? (
        <span className="ml-2 text-[0.75rem] text-[#ff8a6b]">{estado.erro}</span>
      ) : null}
    </form>
  );
}
