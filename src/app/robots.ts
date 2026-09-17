import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Área logada, painel, login e API ficam fora do índice. O /admin já
      // devolve quem não é admin pro /app, então não há o que indexar ali —
      // mas manter o caminho fora do robots.txt é anunciar a superfície de
      // graça.
      disallow: [
        "/app/",
        "/app",
        "/admin/",
        "/admin",
        "/login",
        "/obrigado",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
