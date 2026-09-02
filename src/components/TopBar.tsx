import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function TopBar({ email }: { email?: string | null }) {
  return (
    <header className="nf-nav">
      <div className="nf-nav-inner">
        <Link href="/" className="nf-logo">
          CURSOS
        </Link>
        <nav className="nf-nav-links">
          <Link href="/">Início</Link>
        </nav>
        <div className="nf-nav-right">
          {email ? <span className="nf-nav-user">{email}</span> : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
