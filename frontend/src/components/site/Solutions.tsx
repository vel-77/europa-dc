"use client";

import { useState } from "react";
import { Split } from "./Split";

export type SolutionView = { id: string; title: string; description: string; image: string | null };

const pad = (n: number) => String(n + 1).padStart(2, "0");

export function Solutions({ solutions }: { solutions: SolutionView[] }) {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);

  const select = (index: number) => {
    if (index === active) return;
    setPrevious(active);
    setActive(index);
  };

  return (
    <section id="solutions" className="py-section">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <p className="eyebrow text-taupe-ink col-span-12 -mb-3 lg:-mb-5 reveal">Solutions</p>
          <h2 className="serif ttl col-span-12 lg:col-span-9">
            <Split lines={["Everything your space needs."]} />
          </h2>
          <p className="col-span-12 md:col-span-8 lg:col-span-5 text-lead text-ink/80 reveal" style={{ maxWidth: 610 }}>
            From custom cabinetry to premium surfaces, fixtures, and architectural details, Europa DC brings the essential
            elements of your interior together.
          </p>
        </div>
        <div className="grid-12 mt-10 lg:mt-12 items-start">
          <div className="hidden lg:block col-span-6 lg:col-start-7 lg:row-start-1 self-start sticky top-24">
            <div className="frame aspect-[4/5] reveal-img">
              {solutions.map((solution, index) =>
                solution.image ? (
                  <img
                    key={solution.id}
                    src={solution.image}
                    alt=""
                    className={`sol-img ${index === active ? "on" : index === previous ? "prev" : ""}`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ) : null,
              )}
            </div>
          </div>
          <ol className="sol-list col-span-12 lg:col-span-5 lg:col-start-1 lg:row-start-1">
            {solutions.map((solution, index) => (
              <li
                key={solution.id}
                className={`sol-row reveal ${index === active ? "on" : ""}`}
                onMouseEnter={() => {
                  if (matchMedia("(hover:hover) and (min-width:1024px)").matches) select(index);
                }}
              >
                <a
                  href="#contact"
                  className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-7 lg:py-9"
                  onClick={(event) => {
                    // On phones the row opens its photo instead of jumping to the form.
                    if (matchMedia("(max-width:1023.98px)").matches) {
                      event.preventDefault();
                      select(index);
                    }
                  }}
                >
                  <span className="text-[0.75rem] tracking-[0.18em] text-taupe-ink">{pad(index)}</span>
                  <span>
                    <span className="serif block text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.05]">{solution.title}</span>
                    <span className="mt-2 block text-[0.9375rem] text-ink/70">{solution.description}</span>
                  </span>
                  <span className="arrow">→</span>
                </a>
                {solution.image && (
                  <div className="sol-m lg:hidden">
                    <div>
                      <div className="frame aspect-[3/2] mb-7">
                        <img src={solution.image} alt="" loading="lazy" />
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
