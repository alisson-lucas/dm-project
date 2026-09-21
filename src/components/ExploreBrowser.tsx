"use client";

import { useMemo, useState } from "react";
import type { CatalogCourse } from "../services/catalog";
import { ExploreCard } from "./ExploreCard";
import { scroller, sectionTitle } from "../lib/ui";

const LEVELS = [
  { v: "Todos", label: "Todos os níveis" },
  { v: "BEGINNER", label: "Iniciante" },
  { v: "INTERMEDIATE", label: "Intermediário" },
  { v: "ADVANCED", label: "Avançado" },
];

const chipBase =
  "cursor-pointer border font-medium transition-colors hover:border-accent/60";

// Tira acento e caixa pra comparar: quem digita "pentatonica" tem que achar
// "Pentatônica".
function normal(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function ExploreBrowser({
  courses,
  initialCategory,
  initialQuery = "",
}: {
  courses: CatalogCourse[];
  /** estilo pré-selecionado via ?estilo= (ignorado se não existir no catálogo) */
  initialCategory?: string;
  /** texto vindo da busca do topo (?q=) */
  initialQuery?: string;
}) {
  const [cat, setCat] = useState(() =>
    initialCategory && courses.some((c) => c.category === initialCategory)
      ? initialCategory
      : "Todos"
  );
  const [lvl, setLvl] = useState("Todos");
  const [q, setQ] = useState(initialQuery);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) if (c.category) set.add(c.category);
    return ["Todos", ...[...set].sort((a, b) => a.localeCompare(b, "pt-BR"))];
  }, [courses]);

  const busca = normal(q.trim());
  const filtering = cat !== "Todos" || lvl !== "Todos" || busca.length > 0;

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (cat === "Todos" || c.category === cat) &&
          (lvl === "Todos" || c.level === lvl) &&
          (busca === "" ||
            normal(c.title).includes(busca) ||
            normal(c.description ?? "").includes(busca) ||
            normal(c.category ?? "").includes(busca))
      ),
    [courses, cat, lvl, busca]
  );

  const rows = useMemo(() => {
    const enrolled = courses.filter((c) => c.enrolled);
    const out: { title: string; items: CatalogCourse[] }[] = [
      {
        title: enrolled.length ? "Continue aprendendo" : "Comece por aqui",
        items: (enrolled.length ? enrolled : courses).slice(0, 8),
      },
    ];
    for (const category of categories) {
      if (category === "Todos") continue;
      out.push({
        title: category,
        items: courses.filter((c) => c.category === category),
      });
    }
    return out;
  }, [courses, categories]);

  const resultLine = filtering
    ? `${filtered.length} ${
        filtered.length === 1 ? "curso encontrado" : "cursos encontrados"
      }`
    : `${courses.length} cursos em ${categories.length - 1} estilos`;

  return (
    <>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar curso…"
        aria-label="Pesquisar curso"
        className="mt-8 w-full max-w-[420px] rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[0.88rem] text-text placeholder:text-text-faint focus:border-accent-2 focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`${chipBase} rounded-full px-4 py-2 text-[0.8rem] ${
                on
                  ? "border-accent bg-accent text-white"
                  : "border-white/8 text-text-dim"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {LEVELS.map(({ v, label }) => {
          const on = v === lvl;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setLvl(v)}
              className={`${chipBase} rounded-md px-3.5 py-1.5 text-[0.75rem] tracking-[0.04em] ${
                on
                  ? "border-accent bg-accent text-white"
                  : "border-white/8 text-text-dim"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[0.78rem] tracking-[0.04em] text-text-faint">
        {resultLine}
      </p>

      {filtering ? (
        filtered.length ? (
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[clamp(16px,2.5vw,28px)]">
            {filtered.map((c) => (
              <ExploreCard key={c.id} course={c} layout="grid" />
            ))}
          </div>
        ) : (
          <p className="mt-8 max-w-[48ch] leading-[1.6] text-text-dim">
            Nenhum curso com esses filtros. Tente afrouxar a busca.
          </p>
        )
      ) : (
        <div className="mt-8 flex flex-col gap-9">
          {rows.map((row) =>
            row.items.length === 0 ? null : (
              <section key={row.title}>
                <h3 className={`${sectionTitle} mb-3`}>{row.title}</h3>
                <div className={scroller}>
                  {row.items.map((c) => (
                    <ExploreCard key={c.id} course={c} layout="row" />
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </>
  );
}
