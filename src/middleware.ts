import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/sessionToken";

// Duas responsabilidades:
//
// - `/app/*` é a área do aluno. Sem sessão válida, manda pro /login guardando
//   o destino em ?next. Como o matcher pega o prefixo inteiro, qualquer página
//   nova criada ali já nasce protegida — não dá pra esquecer de listar.
//
// - `/` é a landing pública. Quem JÁ tem sessão é mandado direto pra
//   plataforma, então o visitante recebe a página estática e o aluno que
//   digita só o domínio não precisa clicar em nada.
//
// As rotas de API fazem a própria checagem (getCurrentUser) e ficam de fora.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return session
      ? NextResponse.redirect(new URL("/app", req.url))
      : NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*"],
};
