"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

// Frames of the kitchen build-up video, exported with ffmpeg (6 per second).
const FRAME_COUNT = 85;
const frameUrl = (index: number) => asset(`/hero/f${String(index + 1).padStart(3, "0")}.webp`);

const STAGES = [
  {
    title: ["Spaces That Speak", "Before You Do."],
    text: "European design. Exceptional materials. Interiors created to leave a lasting impression.",
  },
  {
    title: ["Premium materials.", "Thoughtful details."],
    text: "From Dekton surfaces to custom cabinetry and carefully selected fixtures, every element is considered.",
  },
  {
    title: ["Your vision,", "brought to life."],
    text: "A complete kitchen designed around the way you live.",
  },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The opener: an empty room becomes a finished kitchen as the visitor scrolls.
 * The video is pre-cut into frames that are drawn to a canvas, so scrubbing is
 * instant on every device and nothing has to buffer.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = canvas.current;
    const runway = section.current;
    if (!element || !runway) return;
    const context = element.getContext("2d");
    if (!context) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frames: (HTMLImageElement | null)[] = Array(FRAME_COUNT).fill(null);
    let shown = -1;
    let target = reduce ? FRAME_COUNT - 1 : 0;
    let cancelled = false;

    const draw = () => {
      // Draw the latest loaded frame at or before the target, so scrubbing
      // never waits on the network.
      let index = target;
      while (index > 0 && !frames[index]) index -= 1;
      const image = frames[index];
      if (!image || index === shown) return;
      shown = index;
      const ratio = devicePixelRatio || 1;
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (element.width !== width * ratio || element.height !== height * ratio) {
        element.width = width * ratio;
        element.height = height * ratio;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const desktop = innerWidth >= 768;
      // Desktop: fit the whole frame, anchored top-right so the copy on the
      // left sits over the empty part of the room. Phones: fill the box.
      const scale = desktop
        ? Math.min(width / image.naturalWidth, height / image.naturalHeight)
        : Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = width - drawWidth;
      const y = desktop ? 0 : (height - drawHeight) / 2;
      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    const load = (index: number) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => {
          if (!cancelled) {
            frames[index] = image;
            draw();
          }
          resolve();
        };
        image.onerror = () => resolve();
        image.src = frameUrl(index);
      });
    (async () => {
      // First and last frames first, then fill in from the start.
      await load(0);
      await load(FRAME_COUNT - 1);
      for (let index = 1; index < FRAME_COUNT - 1 && !cancelled; index += 1) await load(index);
    })();

    let frame = 0;
    let currentStage = 0;
    const update = () => {
      frame = 0;
      const box = runway.getBoundingClientRect();
      const p = clamp01(-box.top / (box.height - innerHeight));
      target = reduce ? FRAME_COUNT - 1 : Math.round(p * (FRAME_COUNT - 1));
      shown = -1;
      draw();
      setProgress(p);
      const next = p < 0.34 ? 0 : p < 0.7 ? 1 : 2;
      if (next !== currentStage) {
        currentStage = next;
        setStage(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-white" aria-hidden="true">
        <canvas ref={canvas} className="block w-full h-[52svh] md:h-full" />
      </div>
      <section id="hero" ref={section} className="relative h-[340vh]">
        <div className="sticky top-0 z-10 h-[100svh] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-none md:bg-[linear-gradient(to_right,#fff_0%,#fff_30%,rgba(255,255,255,.92)_42%,rgba(255,255,255,.55)_52%,rgba(255,255,255,0)_64%)]" />
          <div className="shell relative h-full">
            <div className="grid-12 h-full">
              <div className="relative col-span-12 md:col-span-7 lg:col-span-6 h-full">
                <div className="hero-copy absolute inset-x-0 top-[calc(52svh+1.5rem)] bottom-[7.5rem] md:top-0 md:bottom-0">
                  {STAGES.map((item, index) => {
                    const Heading = index === 0 ? "h1" : "h2";
                    return (
                      <div key={index} className={`stage ${index === stage ? "on" : ""}`}>
                        <Heading className="serif ttl">
                          {item.title[0]}
                          <br />
                          {item.title[1]}
                        </Heading>
                        <p className="mt-5 lg:mt-8 max-w-none text-lead text-ink/80">{item.text}</p>
                        {index === 2 && (
                          <div className="mt-8 lg:mt-12">
                            <a href="#contact" className="btn btn-dark btn-lg" tabIndex={stage === 2 ? 0 : -1}>
                              Start Your Project <span className="arrow">→</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="absolute inset-x-[var(--spacing-gutter)] bottom-8 lg:bottom-10 flex items-end justify-between gap-6">
              <div className="flex items-center gap-4 text-[0.6875rem] tracking-[0.2em] text-taupe-ink">
                <span className="serif text-[1.125rem] tracking-normal text-charcoal">0{stage + 1}</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="tick w-10 md:w-16">
                      <i style={{ transform: `scaleX(${clamp01((progress - index / 3) * 3)})` }} />
                    </div>
                  ))}
                </div>
                <span>03</span>
              </div>
              <p className="eyebrow text-charcoal bg-ivory px-3 py-2 transition-opacity duration-700" style={{ opacity: progress > 0.05 ? 0 : 1 }}>
                Scroll to explore ↓
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
