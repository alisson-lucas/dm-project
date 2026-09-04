import { OFFER } from "../../lib/landing";

// Botão de compra da landing. É maior e mais "retangular" que o btnPrimary da
// área logada de propósito — segue a referência: caixa alta, letterspacing e
// seta. Com checkoutUrl ainda não configurado ele fica inerte e a página
// avisa, que é melhor do que um link levando pro lugar errado.
export function Cta({
  label = "Quero começar agora",
  className = "",
  note = false,
  full = false,
  variant = "accent",
}: {
  label?: string;
  className?: string;
  /** mostra o aviso de link não configurado abaixo do botão */
  note?: boolean;
  /** ocupa toda a largura disponível (útil no mobile) */
  full?: boolean;
  /** "light" é pra usar EM CIMA de um fundo accent, onde o botão carmim sumiria */
  variant?: "accent" | "light";
}) {
  const configured = Boolean(OFFER.checkoutUrl);

  return (
    <div className={className}>
      <a
        href={OFFER.checkoutUrl ?? "#"}
        {...(configured
          ? { target: "_blank", rel: "noopener noreferrer" }
          : { "aria-disabled": true })}
        className={`group inline-flex items-center justify-center gap-3 rounded-lg px-8 py-4 text-[0.82rem] font-bold uppercase tracking-[0.08em] transition active:translate-y-px ${
          variant === "light"
            ? "bg-white text-accent hover:bg-white/90"
            : "bg-accent text-white shadow-[0_14px_38px_-14px_rgba(158,34,76,0.85)] hover:bg-accent-2"
        } ${full ? "w-full" : ""}`}
      >
        {label}
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </a>

      {note && !configured ? (
        <p
          className={`mt-3 text-[0.75rem] ${
            variant === "light" ? "text-white/70" : "text-text-faint"
          }`}
        >
          ⚠ Link de checkout da Hotmart ainda não configurado — veja{" "}
          <code>OFFER.checkoutUrl</code> em <code>src/lib/landing.ts</code>.
        </p>
      ) : null}
    </div>
  );
}
