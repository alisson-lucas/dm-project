"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CatalogCourse } from "../services/catalog";
import { courseMeta } from "../lib/format";

const AUTO_MS = 7000;

export function HeroCarousel({ courses }: { courses: CatalogCourse[] }) {
  const n = courses.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % n) + n) % n),
    [n]
  );

  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => setIndex((c) => (c + 1) % n), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <section
      className="nf-hcar"
      aria-roledescription="carrossel de cursos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {courses.map((course, idx) => (
        <article
          key={course.id}
          className={`nf-hcar-slide${idx === index ? " is-active" : ""}`}
          aria-hidden={idx !== index}
        >
          <div
            className="nf-hcar-bg"
            style={
              course.coverImageUrl
                ? { backgroundImage: `url(${course.coverImageUrl})` }
                : undefined
            }
          />
          <div className="nf-hcar-content">
            <p className="nf-hero-kicker">
              Curso {idx + 1} de {n}
            </p>
            <h2 className="nf-hero-title">{course.title}</h2>
            {course.description ? (
              <p className="nf-hero-desc">{course.description}</p>
            ) : null}
            <p className="nf-hero-meta">
              {courseMeta(course.moduleCount, course.lessonCount)}
            </p>
            <div className="nf-hero-actions">
              {course.enrolled ? (
                <Link
                  href={`/courses/${course.slug}`}
                  className="nf-btn nf-btn-primary"
                  tabIndex={idx === index ? 0 : -1}
                >
                  ▶ Ver curso
                </Link>
              ) : (
                <span className="nf-hcar-locked">
                  🔒 Disponível após a compra na Hotmart
                </span>
              )}
            </div>
          </div>
        </article>
      ))}

      {n > 1 ? (
        <>
          <button
            type="button"
            className="nf-hcar-nav prev"
            onClick={() => go(index - 1)}
            aria-label="Curso anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="nf-hcar-nav next"
            onClick={() => go(index + 1)}
            aria-label="Próximo curso"
          >
            ›
          </button>
          <div className="nf-hcar-dots">
            {courses.map((course, idx) => (
              <button
                key={course.id}
                type="button"
                className={`nf-hcar-dot${idx === index ? " is-active" : ""}`}
                onClick={() => setIndex(idx)}
                aria-label={`Ir para ${course.title}`}
                aria-current={idx === index}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
