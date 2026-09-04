import Link from "next/link";
import { SITE_NAME } from "../../lib/site";
import { OFFER } from "../../lib/landing";
import { btnGhost } from "../../lib/ui";

// Header da landing — não é o TopBar do aluno (aqui não há sessão nem logout).
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-16 items-center">
      <div className="mx-auto flex w-full max-w-page items-center gap-6 px-[clamp(16px,4vw,48px)]">
        <span className="text-[1.15rem] font-extrabold tracking-[0.2em] text-accent-2">
          {SITE_NAME}
        </span>

        <nav className="ml-auto flex items-center gap-3.5">
          <Link href="/login" className={btnGhost}>
            Já sou aluno
          </Link>
          {OFFER.checkoutUrl ? (
            <a
              href={OFFER.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.85rem] font-semibold text-accent-2 hover:text-text max-sm:hidden"
            >
              Comprar →
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
