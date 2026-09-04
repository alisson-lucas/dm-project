import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // área logada, login e API ficam fora do índice
      disallow: ["/app/", "/app", "/login", "/obrigado", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
