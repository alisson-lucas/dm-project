import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { SITE_NAME } from "../lib/site";

export function TopBar({ email }: { email?: string | null }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-[linear-gradient(180deg,rgba(0,0,0,0.88),rgba(0,0,0,0.4)_60%,transparent)]">
      <div className="flex w-full max-w-page mx-auto items-center gap-7 px-[clamp(16px,4vw,48px)]">
        <Link
          href="/app"
          className="text-[1.15rem] font-extrabold tracking-[0.2em] text-accent-2"
        >
          {SITE_NAME}
        </Link>
        <nav className="flex gap-5 text-[0.9rem] text-text-dim max-sm:hidden">
          <Link href="/app" className="hover:text-text">
            Início
          </Link>
          <Link href="/app/explorar" className="hover:text-text">
            Explorar
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3.5">
          {email ? (
            <span className="text-[0.82rem] text-text-faint max-sm:hidden">
              {email}
            </span>
          ) : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
