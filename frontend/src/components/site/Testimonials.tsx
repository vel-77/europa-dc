"use client";

import { useEffect, useRef } from "react";
import { Split } from "./Split";

export type TestimonialView = { id: string; quote: string; author: string };

/** A rail of quotes that drifts right to left and loops without a visible jump. */
export function Testimonials({ testimonials }: { testimonials: TestimonialView[] }) {
  const view = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLElement>(null);
  const controls = useRef<{ nudge: (direction: number) => void }>({ nudge: () => {} });
  const count = testimonials.length;

  useEffect(() => {
    const viewElement = view.current;
    const railElement = rail.current;
    const bar = progress.current;
    if (!viewElement || !railElement || !bar || count === 0) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      viewElement.style.overflowX = "auto";
      return;
    }
    const cards = Array.from(railElement.children) as HTMLElement[];
    let loopWidth = 1;
    let step = 1;
    let x = 0;
    let velocity = 0;
    let last = 0;
    let inView = false;
    let hover = false;
    let tapPaused = false;
    let holdUntil = 0;
    let tween: { from: number; to: number; t0: number; ms: number } | null = null;
    let drag: { sx: number; sy: number; x0: number; moved: boolean; axis: "x" | "y" | null } | null = null;

    const measure = () => {
      loopWidth = cards[count].offsetLeft - cards[0].offsetLeft;
      step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
    };
    const speed = () => (innerWidth >= 1024 ? 34 : 22);
    const wrap = (n: number) => ((n % loopWidth) + loopWidth) % loopWidth;
    let rendered = NaN;
    const render = () => {
      const w = Math.round(wrap(x) * 100) / 100;
      // The loop runs every frame; only touch the DOM when the rail actually moved.
      if (w === rendered) return;
      rendered = w;
      railElement.style.transform = `translate3d(${-w}px,0,0)`;
      // The bar is a quarter of the track wide, so 300% of its width spans the track.
      bar.style.transform = `translateX(${((w / loopWidth) * 300).toFixed(3)}%)`;
    };
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const glide = (to: number, ms: number) => {
      tween = { from: x, to, t0: performance.now(), ms };
      velocity = 0;
    };
    let frame = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      if (tween) {
        const k = Math.min(1, (t - tween.t0) / tween.ms);
        x = tween.from + (tween.to - tween.from) * ease(k);
        if (k === 1) tween = null;
      } else if (!drag) {
        const run = inView && !hover && !tapPaused && t > holdUntil && !document.hidden;
        velocity = run ? velocity + (speed() - velocity) * Math.min(1, dt * 2.5) : 0;
        x += velocity * dt;
      }
      render();
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.2 });
    observer.observe(viewElement);

    controls.current.nudge = (direction) => {
      const base = Math.round(x / step) * step;
      glide(base + direction * step, 900);
      holdUntil = performance.now() + 900 + 2500;
      tapPaused = false;
    };
    const onEnter = (event: PointerEvent) => event.pointerType === "mouse" && (hover = true);
    const onLeave = (event: PointerEvent) => event.pointerType === "mouse" && (hover = false);
    cards.forEach((card) => {
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", onLeave);
    });
    // Touch: a horizontal drag moves the rail, a tap pauses it, vertical gestures stay with the page.
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      drag = { sx: event.clientX, sy: event.clientY, x0: x, moved: false, axis: null };
      tween = null;
    };
    const onMove = (event: PointerEvent) => {
      if (!drag) return;
      const dx = event.clientX - drag.sx;
      const dy = event.clientY - drag.sy;
      if (!drag.axis && Math.hypot(dx, dy) > 8) drag.axis = Math.abs(dx) > Math.abs(dy) * 1.3 ? "x" : "y";
      if (drag.axis === "x") {
        drag.moved = true;
        x = drag.x0 - dx;
      } else if (drag.axis === "y") drag = null;
    };
    const onUp = (event: PointerEvent) => {
      if (!drag) return;
      const d = drag;
      drag = null;
      if (!d.moved && !d.axis) {
        tapPaused = !tapPaused;
        return;
      }
      const dx = event.clientX - d.sx;
      tapPaused = false;
      const direction = Math.abs(dx) > 40 ? (dx < 0 ? 1 : -1) : 0;
      glide((Math.round(d.x0 / step) + direction) * step, 650);
      holdUntil = performance.now() + 650 + 1500;
    };
    const onCancel = () => (drag = null);
    viewElement.addEventListener("pointerdown", onDown);
    viewElement.addEventListener("pointermove", onMove);
    viewElement.addEventListener("pointerup", onUp);
    viewElement.addEventListener("pointercancel", onCancel);
    const onResize = () => {
      const fraction = wrap(x) / loopWidth;
      measure();
      x = fraction * loopWidth;
    };
    addEventListener("resize", onResize);
    measure();
    frame = requestAnimationFrame((t) => {
      last = t;
      tick(t);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("resize", onResize);
      viewElement.removeEventListener("pointerdown", onDown);
      viewElement.removeEventListener("pointermove", onMove);
      viewElement.removeEventListener("pointerup", onUp);
      viewElement.removeEventListener("pointercancel", onCancel);
    };
  }, [count]);

  if (count === 0) return null;

  // Three copies so the loop can wrap by one set width without a visible seam.
  const copies = [0, 1, 2].flatMap((copy) => testimonials.map((item) => ({ ...item, copy })));

  return (
    <section id="testimonials" className="py-section bg-bone overflow-hidden">
      <div className="shell">
        <div className="grid-12 gap-y-6 items-end">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow text-taupe-ink reveal">Client experiences</p>
            <h2 className="serif ttl mt-5 lg:mt-6">
              <Split lines={["Designed with intention.", "Remembered for the experience."]} />
            </h2>
          </div>
          <p className="col-span-12 lg:col-span-4 lg:col-start-9 text-[1rem] leading-[1.7] text-ink/75 reveal">
            Every project is personal. From the first conversation to the final details, we’re proud to build lasting
            relationships through thoughtful design, trusted guidance, and an uncompromising commitment to quality.
          </p>
        </div>
      </div>
      <div ref={view} className="mt-12 lg:mt-16 touch-pan-y select-none" aria-roledescription="carousel" aria-label="Client testimonials">
        <div ref={rail} className="flex gap-4 lg:gap-6 w-max px-4 lg:px-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))] will-change-transform">
          {copies.map((item) => (
            <figure
              key={`${item.copy}-${item.id}`}
              className="tc-card relative shrink-0 flex flex-col bg-paper border border-line rounded-2xl overflow-hidden w-[86vw] max-w-[26rem] lg:max-w-none lg:w-[30rem] h-[25rem] lg:h-[29rem] p-7 lg:p-10"
              aria-hidden={item.copy > 0}
            >
              <span className="serif text-[5rem] lg:text-[6.5rem] leading-[0.6] h-[2.25rem] lg:h-[2.75rem] text-stone" aria-hidden="true">
                “
              </span>
              <blockquote className="serif mt-6 text-[1.375rem] lg:text-[1.75rem] leading-[1.28] tracking-[-0.005em] text-pretty">
                {item.quote}
              </blockquote>
              <figcaption className="mt-auto pt-6 border-t border-line text-[0.9375rem] font-medium">— {item.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="shell mt-8 lg:mt-10">
        <div className="flex items-center gap-6 text-[0.75rem] tracking-[0.16em] uppercase">
          <button type="button" className="min-h-11 text-taupe-ink hover:text-ink transition-colors" aria-label="Previous testimonial" onClick={() => controls.current.nudge(-1)}>
            ← Previous
          </button>
          <span className="relative flex-1 h-px bg-line" aria-hidden="true">
            <i ref={progress} className="absolute left-0 top-0 h-px w-[25%] bg-charcoal" />
          </span>
          <button type="button" className="min-h-11 text-taupe-ink hover:text-ink transition-colors" aria-label="Next testimonial" onClick={() => controls.current.nudge(1)}>
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
