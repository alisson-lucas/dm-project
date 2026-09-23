"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Product } from "@prisma/client";
import {
  removerProduto,
  salvarProduto,
  type ProdutoState,
} from "@/app/admin/actions";
import { btnPrimary } from "@/lib/ui";
import { Campo, Pendencia, acaoPerigo, campo } from "./fields";

// O mapa que liga a compra na Hotmart a este curso. É o elo que o webhook
// percorre quando chega um PURCHASE_APPROVED — sem nenhuma linha aqui, o aluno
// paga e o acesso não é liberado.

export function ProductMap({
  courseId,
  produtos,
}: {
  courseId: string;
  produtos: Product[];
}) {
  const [estado, formAction, enviando] = useActionState<ProdutoState, FormData>(
    salvarProduto,
    { erros: {} }
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Some o que foi digitado depois que a linha entrou na lista — senão o campo
  // fica com o código anterior e convida a cadastrar duplicado.
  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <section className="mt-12">
      <h2 className="text-[1.05rem] font-bold">Produto na Hotmart</h2>
      <p className="mt-1.5 max-w-[70ch] text-[0.85rem] leading-[1.6] text-text-dim">
        É isto que transforma a compra em acesso: quando a Hotmart avisa que
        alguém comprou, o sistema procura aqui de qual curso é aquele produto.
        O código do produto está no painel da Hotmart, no endereço de checkout
        do produto.
      </p>

      {produtos.length === 0 ? (
        <div className="mt-4">
          <Pendencia>
            Nenhum produto ligado. Quem comprar este curso <strong>não vai
            receber o acesso</strong> — a compra chega e o sistema não sabe o
            que liberar.
          </Pendencia>
        </div>
      ) : (
        <ul className="mt-4 overflow-hidden rounded-xl border border-white/8 bg-bg-2/60">
          {produtos.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.06] px-4 py-3 last:border-b-0"
            >
              <span className="flex-1 font-mono text-[0.85rem]">
                {p.hotmartProductId}
              </span>
              <span className="text-[0.78rem] text-text-faint">
                {p.hotmartOfferCode
                  ? `oferta ${p.hotmartOfferCode}`
                  : "todas as ofertas"}
              </span>
              <form
                action={removerProduto}
                onSubmit={(e) => {
                  if (!confirm("Desligar este produto do curso?")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className={acaoPerigo}>
                  Desligar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 flex flex-wrap items-start gap-3"
      >
        <input type="hidden" name="courseId" value={courseId} />

        <div className="min-w-[220px] flex-1">
          <Campo
            label="Código do produto"
            ajuda="Só números, como aparece na Hotmart."
            erro={estado.erros.hotmartProductId}
          >
            <input
              name="hotmartProductId"
              required
              defaultValue={estado.valores?.hotmartProductId ?? ""}
              placeholder="1234567"
              className={campo}
            />
          </Campo>
        </div>

        <div className="min-w-[220px] flex-1">
          <Campo
            label="Código da oferta (opcional)"
            ajuda="Só se o produto tiver ofertas diferentes que dão cursos diferentes."
            erro={estado.erros.hotmartOfferCode}
          >
            <input
              name="hotmartOfferCode"
              defaultValue={estado.valores?.hotmartOfferCode ?? ""}
              placeholder="em branco = qualquer oferta"
              className={campo}
            />
          </Campo>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className={`${btnPrimary} mt-[1.65rem]`}
        >
          {enviando ? "Ligando…" : "Ligar produto"}
        </button>
      </form>
    </section>
  );
}
