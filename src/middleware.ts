import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/sessionToken";

// Barra o acesso às páginas de curso/aula pra quem não tem sessão válida,
// redirecionando pro /login. As rotas de API fazem a própria checagem
// (getCurrentUser), então ficam de fora do matcher.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/courses/:path*", "/lessons/:path*"],
};
