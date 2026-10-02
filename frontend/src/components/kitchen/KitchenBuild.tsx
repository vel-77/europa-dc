"use client";

import { useEffect, useRef, useState } from "react";
import { buildKitchen, INTRO_END, STAGE_STARTS, VIEW_BOX } from "./geometry";

export type BuildStage = {
  /** Short name used in the step list. */
  label: string;
  title: string;
  text: string;
  /** Brand names to list under the text, if any. */
  brands?: string[];
};

type Props = {
  stages: BuildStage[];
  hint: string;
  cta: { label: string; href: string };
};

// The drawing never changes, so it is generated once for the whole app.
const ITEMS = buildKitchen();

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The home page opener: a kitchen sketch that draws itself as the visitor
 * scrolls. The section is a tall "runway" with a sticky viewport inside it;
 * how far the runway has been scrolled decides how much of the drawing shows.
 */
export function KitchenBuild({ stages, hint, cta }: Props) {
  const runway = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    // With reduced motion the stylesheet shows the finished drawing and lays
    // the steps out as a normal list, so there is nothing to drive.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = runway.current;
    if (!section || !svg.current) return;

    const nodes = Array.from(svg.current.querySelectorAll<SVGElement>("[data-from]"), (element) => ({
      element,
      from: Number(element.dataset.from),
      to: Number(element.dataset.to),
      isStroke: element.tagName === "path",
      shown: 0,
    }));

    const startedAt = performance.now();
    let frame = 0;
    let stage = 0;

    const render = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const scrolled = clamp(-rect.top / (rect.height - window.innerHeight));
      // The room outline draws itself on load; scrolling does the rest.
      const intro = clamp((performance.now() - startedAt) / 1800);
      const eased = 1 - (1 - intro) ** 3;
      const progress = INTRO_END * eased + (1 - INTRO_END) * scrolled;

      for (const node of nodes) {
        const amount = Math.round(clamp((progress - node.from) / (node.to - node.from)) * 1000) / 1000;
        if (amount === node.shown) continue;
        node.shown = amount;
        if (node.isStroke) {
          node.element.style.strokeDashoffset = String(1 - amount);
          node.element.style.visibility = amount === 0 ? "hidden" : "visible";
        } else {
          node.element.style.opacity = String(amount);
        }
      }

      let next = 0;
      while (next < STAGE_STARTS.length - 1 && progress >= STAGE_STARTS[next + 1] - 0.015) next += 1;
      if (next !== stage) {
        stage = next;
        setActive(next);
      }
      if (intro < 1) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  function jumpTo(index: number) {
    const section = runway.current;
    if (!section) return;
    // Land where the chosen step has just finished drawing.
    const target = index === 0 ? 0 : (STAGE_STARTS[index + 1] ?? 1) - 0.02;
    const scrolled = clamp((target - INTRO_END) / (1 - INTRO_END));
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + scrolled * (section.offsetHeight - window.innerHeight), behavior: "smooth" });
  }

  const last = stages.length - 1;

  return (
    <section className="build" ref={runway} aria-label="How a kitchen comes together">
      <div className="build-stage">
        <div className="build-copy">
          {stages.map((stage, index) => (
            <article key={stage.label} className="build-caption" data-active={index === active}>
              {index === 0 ? <h1>{stage.title}</h1> : <h2>{stage.title}</h2>}
              <p>{stage.text}</p>
              {stage.brands && stage.brands.length > 0 && <p className="build-brands">{stage.brands.join(", ")}</p>}
              {index === 0 && <p className="build-hint">{hint}</p>}
              {index === last && (
                <a className="button" href={cta.href} tabIndex={index === active ? 0 : -1}>
                  {cta.label}
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="build-drawing">
          <svg ref={svg} viewBox={VIEW_BOX} role="img" aria-label="Pencil sketch of a kitchen being drawn step by step">
            {ITEMS.map((item, index) => {
              if (item.kind === "stroke") {
                return (
                  <path key={index} d={item.d} pathLength={1} className={`k-${item.tone}`} data-from={item.from} data-to={item.to} />
                );
              }
              if (item.kind === "fill") {
                return (
                  <polygon key={index} points={item.points} style={{ fill: item.color }} data-from={item.from} data-to={item.to} />
                );
              }
              return (
                <text
                  key={index}
                  x={item.x}
                  y={item.y}
                  transform={item.rotate ? `rotate(${item.rotate} ${item.x} ${item.y})` : undefined}
                  className="k-note"
                  data-from={item.from}
                  data-to={item.to}
                >
                  {item.text}
                </text>
              );
            })}
          </svg>
        </div>

        <ol className="build-rail" aria-label="Steps">
          {stages.slice(0, last).map((stage, index) => (
            <li key={stage.label}>
              <button type="button" aria-current={index === active ? "step" : undefined} onClick={() => jumpTo(index)}>
                {stage.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
