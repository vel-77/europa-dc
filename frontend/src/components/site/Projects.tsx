"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryDialog } from "./GalleryDialog";
import { Split } from "./Split";

export type ProjectView = { id: string; title: string; tags: string; location: string; cover: string | null; gallery: string[] };

const pad = (n: number) => String(n + 1).padStart(2, "0");
const DURATION = 4000;

/** Featured projects: a full-bleed carousel that plays on its own and a gallery dialog per project. */
export function Projects({ projects }: { projects: ProjectView[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [fill, setFill] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const held = useRef(false);
  const inView = useRef(false);
  const elapsed = useRef(0);
  const count = projects.length;

  const show = (index: number) => {
    const next = (index + count) % count;
    if (next === current) return;
    setPrevious(current);
    setCurrent(next);
    elapsed.current = 0;
    setFill(0);
  };
  const showRef = useRef(show);
  showRef.current = show;

  useEffect(() => {
    const element = root.current;
    if (!element || count < 2) return;
    const observer = new IntersectionObserver(([entry]) => (inView.current = entry.isIntersecting), { threshold: 0.5 });
    observer.observe(element);
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      if (inView.current && !held.current && !document.hidden && open === null) {
        elapsed.current += Math.min(100, now - last);
        if (elapsed.current >= DURATION) showRef.current(current + 1);
        else setFill(elapsed.current / DURATION);
      }
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [current, count, open]);

  // Hovering or focusing a control pauses the autoplay; leaving resumes it shortly after.
  const resume = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hold = () => {
    clearTimeout(resume.current);
    held.current = true;
  };
  const release = () => {
    clearTimeout(resume.current);
    resume.current = setTimeout(() => (held.current = false), 1500);
  };
  const controlProps = {
    onPointerEnter: (event: React.PointerEvent) => event.pointerType === "mouse" && hold(),
    onPointerLeave: (event: React.PointerEvent) => event.pointerType === "mouse" && release(),
    onFocus: hold,
    onBlur: release,
  };

  const swipe = useRef<{ x: number; y: number } | null>(null);

  if (count === 0) return null;

  const navButton = (index: number, layout: "mobile" | "desktop") => (
    <button
      type="button"
      className={`ps-nav flex items-center min-h-11 text-[0.75rem] ${layout === "mobile" ? "gap-2.5 pr-2.5 tracking-[0.16em]" : "gap-4 tracking-[0.18em]"} ${index === current ? "on" : ""}`}
      aria-label={`Project ${index + 1}: ${projects[index].title}`}
      aria-current={index === current ? "true" : undefined}
      onClick={() => show(index)}
      {...controlProps}
    >
      {layout === "mobile" && <span>{pad(index)}</span>}
      <span className={`ps-bar relative block h-px ${layout === "mobile" ? "w-7" : "w-12"}`}>
        <i className="ps-fill" style={{ transform: `scaleX(${index === current ? Math.min(1, fill) : 0})` }} />
      </span>
      {layout === "desktop" && <span>{pad(index)}</span>}
    </button>
  );

  return (
    <section id="projects" className="pt-section">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <p className="eyebrow text-taupe-ink col-span-12 -mb-3 lg:-mb-5 reveal">Featured projects</p>
          <h2 className="serif ttl col-span-12 lg:col-span-8">
            <Split lines={["A considered approach", "to every space."]} />
          </h2>
          <div className="col-span-12 lg:col-span-8 lg:row-start-3 space-y-5 text-[1rem] leading-[1.7] text-ink/75 reveal">
            <p>
              Our projects reflect a thoughtful balance of form, function, and materiality. From custom kitchens and bathrooms
              to closets and complete interior solutions, each space is carefully developed around the architecture,
              lifestyle, and individual vision of our clients.
            </p>
            <p>
              Through refined materials, precise detailing, and European craftsmanship, we create interiors designed to feel
              cohesive, distinctive, and enduring.
            </p>
          </div>
        </div>
      </div>

      <div
        id="ps"
        ref={root}
        className="relative mt-16 lg:mt-24 lg:h-[100svh] lg:min-h-[40rem] bg-charcoal lg:grid lg:grid-cols-[minmax(0,1fr)_10rem]"
        aria-roledescription="carousel"
        aria-label="Featured projects"
      >
        <div className="relative">
          <div
            className="relative aspect-[3/2] lg:aspect-auto lg:absolute lg:inset-0 overflow-hidden bg-charcoal touch-pan-y select-none"
            onPointerDown={(event) => (swipe.current = { x: event.clientX, y: event.clientY })}
            onPointerUp={(event) => {
              if (!swipe.current) return;
              const dx = event.clientX - swipe.current.x;
              const dy = event.clientY - swipe.current.y;
              swipe.current = null;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
            }}
            onPointerCancel={() => (swipe.current = null)}
          >
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`ps-slide ${index === current ? "cur" : index === previous ? "prev" : ""}`}
              >
                {project.cover && <img src={project.cover} alt={project.title} loading={index === 0 ? "eager" : "lazy"} />}
              </div>
            ))}
          </div>
          <div className="relative z-[5] bg-ivory lg:absolute lg:left-0 lg:bottom-0 lg:right-auto lg:w-[min(36rem,52vw)]">
            <div id="ps-info" className="relative px-4 py-5 lg:p-6 lg:pr-16 lg:h-[21rem]" aria-live="polite">
              {projects.map((project, index) => (
                <div key={project.id} className={`ps-item ${index === current ? "on" : ""}`} aria-hidden={index !== current}>
                  <p className="ps-l serif text-[2.5rem] lg:text-[clamp(3.5rem,5vw,5rem)] leading-none text-bronze">
                    <span>{pad(index)}</span>
                  </p>
                  <h3 className="ps-l serif mt-3 lg:mt-5 text-[1.75rem] lg:text-[clamp(2rem,2.8vw,2.875rem)] leading-[1.02] uppercase tracking-[0.02em]">
                    <span>{project.title}</span>
                  </h3>
                  <p className="ps-l mt-3 lg:mt-4 eyebrow text-taupe-ink">
                    <span>{project.tags}</span>
                  </p>
                  <p className="ps-l mt-2 text-[0.875rem] text-ink/65">
                    <span>{project.location}</span>
                  </p>
                  <p className="ps-l mt-4 lg:mt-7">
                    <span>
                      <button
                        type="button"
                        className="tlink"
                        tabIndex={index === current ? 0 : -1}
                        aria-haspopup="dialog"
                        onClick={() => setOpen(index)}
                        {...controlProps}
                      >
                        View Project <span className="arrow">→</span>
                      </button>
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <ol
              className="lg:hidden absolute left-0 right-0 bottom-full flex items-center px-5 pt-10 pb-1 text-ivory bg-[linear-gradient(to_top,rgba(20,18,16,.55),rgba(20,18,16,0))]"
              aria-label="Projects"
            >
              {projects.map((project, index) => (
                <li key={project.id} className="flex items-center">
                  {navButton(index, "mobile")}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="hidden lg:flex flex-col justify-end px-8 py-12 text-stone">
          <ol className="flex flex-col gap-2" aria-label="Projects">
            {projects.map((project, index) => (
              <li key={project.id}>{navButton(index, "desktop")}</li>
            ))}
          </ol>
        </div>
      </div>

      {open !== null && (
        <GalleryDialog
          title={projects[open].title}
          subtitle={[projects[open].tags, projects[open].location]}
          photos={projects[open].gallery.length > 0 ? projects[open].gallery : projects[open].cover ? [projects[open].cover] : []}
          closeLabel="Close project"
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
