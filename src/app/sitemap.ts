import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Só a landing é pública. As páginas da plataforma são conteúdo pago atrás de
// login e ficam fora do sitemap de propósito.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
