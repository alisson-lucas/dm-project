import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import {
  courseLevelLabel,
  formatDurationCompact,
  plural,
} from "../lib/format";
import { LANDING_IMAGES } from "../lib/landing";
import { isPlaceholderCover } from "../lib/covers";

// Dados públicos da landing. Diferente do catálogo da área logada, aqui não
// existe usuário nem matrícula — é só o que o visitante pode ver.
//
// A landing é ISR (ver `revalidate` na página), então isso roda no build e a
// cada revalidação, não a cada visita.

export interface LandingCourse {
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  levelLabel: string | null;
  moduleCount: number;
  lessonCount: number;
  durationLabel: string | null;
}

export interface LandingData {
  courses: LandingCourse[];
  categories: string[];
  totals: {
    courses: number;
    lessons: number;
    hours: number;
    durationLabel: string | null;
  };
  /** só os caminhos que existem de verdade em public/ — o resto vem null */
  images: {
    hero: string | null;
    /** capa padrão usada por todos os cards do carrossel de cursos */
    courseCover: string | null;
    /** true quando o hero é png/webp, ou seja, recorte com fundo transparente */
    heroIsCutout: boolean;
    about: string | null;
    og: string | null;
  };
}

// A landing não pode falhar de build por causa do banco. Se a consulta cair,
// as seções que dependem de dados somem e o resto da página continua de pé.
const EMPTY: Omit<LandingData, "images"> = {
  courses: [],
  categories: [],
  totals: { courses: 0, lessons: 0, hours: 0, durationLabel: null },
};

// Recebe o caminho SEM extensão e devolve a primeira que existir de verdade.
// Assim o professor pode mandar png, webp ou jpg sem ninguém mexer no código.
const EXTENSIONS = [".png", ".webp", ".jpg", ".jpeg"];

function resolveImage(basePath: string): string | null {
  for (const ext of EXTENSIONS) {
    const publicPath = `${basePath}${ext}`;
    try {
      const abs = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
      if (fs.existsSync(abs)) return publicPath;
    } catch {
      // ignora e tenta a próxima extensão
    }
  }
  return null;
}

export async function getLandingData(): Promise<LandingData> {
  const hero = resolveImage(LANDING_IMAGES.hero);
  const images = {
    hero,
    courseCover: resolveImage(LANDING_IMAGES.courseCover),
    heroIsCutout: /\.(png|webp)$/i.test(hero ?? ""),
    about: resolveImage(LANDING_IMAGES.about),
    og: resolveImage(LANDING_IMAGES.og),
  };

  let base = EMPTY;
  try {
    const rows = await prisma.course.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { modules: true } },
        modules: { select: { lessons: { select: { durationSeconds: true } } } },
      },
    });

    const courses: LandingCourse[] = rows.map((c) => {
      const lessons = c.modules.reduce((n, m) => n + m.lessons.length, 0);
      const seconds = c.modules.reduce(
        (n, m) => n + m.lessons.reduce((s, l) => s + (l.durationSeconds ?? 0), 0),
        0
      );
      return {
        slug: c.slug,
        title: c.title,
        description: c.description,
        // null aqui de propósito: o carrossel cai na capa da marca
        coverImageUrl: isPlaceholderCover(c.coverImageUrl) ? null : c.coverImageUrl,
        category: c.category,
        levelLabel: courseLevelLabel(c.level),
        moduleCount: c._count.modules,
        lessonCount: lessons,
        durationLabel: formatDurationCompact(seconds),
      };
    });

    const seconds = rows.reduce(
      (n, c) =>
        n +
        c.modules.reduce(
          (s, m) => s + m.lessons.reduce((x, l) => x + (l.durationSeconds ?? 0), 0),
          0
        ),
      0
    );

    base = {
      courses,
      categories: [
        ...new Set(courses.map((c) => c.category).filter((c): c is string => !!c)),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
      totals: {
        courses: courses.length,
        lessons: courses.reduce((n, c) => n + c.lessonCount, 0),
        hours: Math.floor(seconds / 3600),
        durationLabel: formatDurationCompact(seconds),
      },
    };
  } catch (err) {
    console.error("getLandingData: catálogo indisponível, landing segue sem ele", err);
  }

  return { ...base, images };
}

export { plural };
