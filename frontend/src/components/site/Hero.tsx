"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

// Frames of the kitchen build-up video, exported with ffmpeg at 12 per second
// in two sizes; large or high-density screens get the full 1080p frames.
const FRAME_COUNT = 170;
const frameUrl = (index: number, size: 1280 | 1920) => asset(`/hero/${size}/f${String(index + 1).padStart(3, "0")}.webp`);

// How quickly the picture catches up with the scroll position. Easing lets a
// mouse-wheel step glide through the frames in between instead of jumping.
const EASE_MS = 80;
const PARALLEL_DOWNLOADS = 6;

// Browsers throw away the decoded pixels of images that are not on the page,
// and decoding again while drawing stalls the frame. So a window of frames
// around the current one is kept decoded as ImageBitmaps, within this budget.
const DECODED_BUDGET_BYTES = 96 * 1024 * 1024;
const DECODES_AT_ONCE = 3;

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

type Picture = ImageBitmap | HTMLImageElement;

/**
 * Decodes a downloaded frame. createImageBitmap on a Blob decodes on a
 * background thread; the <img> fallback is only for browsers without it.
 */
async function decodeFrame(file: Blob): Promise<Picture> {
  if (typeof createImageBitmap === "function") return createImageBitmap(file);
  const image = new Image();
  const url = URL.createObjectURL(file);
  image.src = url;
  try {
    await image.decode();
  } finally {
    URL.revokeObjectURL(url);
  }
  return image;
}

const release = (picture: Picture) => {
  if ("close" in picture) picture.close();
};

/** First and last frame, then every 16th, 8th, 4th... so the whole animation is scrubbable early. */
function loadOrder(count: number) {
  const order = [0, count - 1];
  const queued = new Set(order);
  for (let stride = 16; stride >= 1; stride /= 2) {
    for (let index = 0; index < count; index += stride) {
      if (!queued.has(index)) {
        queued.add(index);
        order.push(index);
      }
    }
  }
  return order;
}

/**
 * The opener: an empty room becomes a finished kitchen as the visitor scrolls.
 * The video is pre-cut into frames that are drawn to a canvas, so scrubbing is
 * instant on every device and nothing has to buffer.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ticks = useRef<(HTMLElement | null)[]>([]);
  const hint = useRef<HTMLParagraphElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const element = canvas.current;
    const runway = section.current;
    if (!element || !runway) return;
    // Opaque canvases composite faster; the empty area is filled white below.
    const context = element.getContext("2d", { alpha: false });
    if (!context) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const size = element.clientWidth * (devicePixelRatio || 1) > 1400 ? 1920 : 1280;
    // Downloaded frames, still compressed: about 7 to 13 MB in total.
    const files: (Blob | null)[] = Array(FRAME_COUNT).fill(null);
    let cancelled = false;

    // Decoded frames ready to draw, kept for a window around the current one.
    const [frameWidth, frameHeight] = size === 1920 ? [1920, 1080] : [1280, 720];
    const radius = Math.max(4, Math.min(16, Math.floor(DECODED_BUDGET_BYTES / (frameWidth * frameHeight * 4) / 2)));
    const decoded = new Map<number, Picture>();
    const decoding = new Set<number>();

    // Where the frame sits on the canvas, in canvas pixels. Recomputed on resize.
    let placement: { x: number; y: number; width: number; height: number } | null = null;
    let painted = "";

    const fit = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const desktop = innerWidth >= 768;
      // Desktop: fit the whole frame, anchored top-right so the copy on the
      // left sits over the empty part of the room. Phones: fill the box.
      const scale = desktop ? Math.min(width / frameWidth, height / frameHeight) : Math.max(width / frameWidth, height / frameHeight);
      const drawWidth = frameWidth * scale;
      const drawHeight = frameHeight * scale;
      // Never give the canvas more pixels than the frame itself has: past that
      // the GPU fills extra pixels with no extra detail. Each draw is then a
      // 1:1 copy and the browser scales the finished canvas.
      const ratio = Math.min(devicePixelRatio || 1, frameWidth / drawWidth);
      const canvasWidth = Math.round(width * ratio);
      const canvasHeight = Math.round(height * ratio);
      if (element.width !== canvasWidth || element.height !== canvasHeight) {
        element.width = canvasWidth;
        element.height = canvasHeight;
      }
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      placement = {
        x: Math.round((width - drawWidth) * ratio),
        y: desktop ? 0 : Math.round(((height - drawHeight) / 2) * ratio),
        width: Math.round(drawWidth * ratio),
        height: Math.round(drawHeight * ratio),
      };
      painted = "";
    };

    // `position` is a fractional frame number; between two frames they are blended.
    let position = reduce ? FRAME_COUNT - 1 : 0;

    /** Keeps the frames around `center` decoded, closest first, and frees the rest. */
    const prepare = (center: number) => {
      if (cancelled) return;
      for (const [index, picture] of decoded) {
        if (Math.abs(index - center) > radius + 2) {
          release(picture);
          decoded.delete(index);
        }
      }
      for (let distance = 0; distance <= radius && decoding.size < DECODES_AT_ONCE; distance += 1) {
        for (const index of distance === 0 ? [center] : [center + distance, center - distance]) {
          const file = files[index];
          if (!file || decoded.has(index) || decoding.has(index) || decoding.size >= DECODES_AT_ONCE) continue;
          decoding.add(index);
          decodeFrame(file).then(
            (picture) => {
              decoding.delete(index);
              if (cancelled || Math.abs(index - Math.round(position)) > radius + 2) release(picture);
              else decoded.set(index, picture);
              prepare(Math.round(position));
              schedule();
            },
            () => decoding.delete(index),
          );
        }
      }
    };

    const nearestDecoded = (index: number) => {
      for (let distance = 0; distance <= radius + 2; distance += 1) {
        if (decoded.has(index - distance)) return index - distance;
        if (decoded.has(index + distance)) return index + distance;
      }
      return -1;
    };

    const paint = () => {
      if (!placement) return;
      let base = Math.floor(position);
      // 32 blend steps between two frames is finer than the eye can tell apart.
      let mix = Math.round((position - base) * 32) / 32;
      if (mix === 1) {
        base += 1;
        mix = 0;
      }
      let first = decoded.get(base);
      let second = mix > 0 ? decoded.get(base + 1) : undefined;
      let key = `${base}:${mix}`;
      if (!first || (mix > 0 && !second)) {
        // Not decoded yet: show the closest frame that is, rather than stall.
        // If none is, the previous picture simply stays on the canvas.
        const near = nearestDecoded(Math.round(position));
        first = decoded.get(near);
        second = undefined;
        mix = 0;
        key = `${near}:0`;
      }
      if (!first || key === painted) return;
      painted = key;
      const { x, y, width, height } = placement;
      context.globalAlpha = 1;
      context.drawImage(first, x, y, width, height);
      if (second && mix > 0) {
        context.globalAlpha = mix;
        context.drawImage(second, x, y, width, height);
        context.globalAlpha = 1;
      }
    };

    // Scroll metrics are measured on resize only, so frames never read layout.
    let runwayTop = 0;
    let runwaySpan = 1;
    const measure = () => {
      runwayTop = runway.getBoundingClientRect().top + scrollY;
      runwaySpan = Math.max(1, runway.offsetHeight - innerHeight);
    };

    let shownStage = 0;
    const shownTicks = [-1, -1, -1];
    let hintVisible = true;
    const updateChrome = (progress: number) => {
      for (let index = 0; index < 3; index += 1) {
        const fill = Math.round(clamp01((progress - index / 3) * 3) * 1000) / 1000;
        const tick = ticks.current[index];
        if (tick && fill !== shownTicks[index]) {
          tick.style.transform = `scaleX(${fill})`;
          shownTicks[index] = fill;
        }
      }
      const showHint = progress <= 0.05;
      if (hint.current && showHint !== hintVisible) {
        hint.current.style.opacity = showHint ? "1" : "0";
        hintVisible = showHint;
      }
      const nextStage = progress < 0.34 ? 0 : progress < 0.7 ? 1 : 2;
      if (nextStage !== shownStage) {
        shownStage = nextStage;
        setStage(nextStage);
      }
    };

    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      frame = 0;
      const progress = clamp01((scrollY - runwayTop) / runwaySpan);
      const goal = reduce ? FRAME_COUNT - 1 : progress * (FRAME_COUNT - 1);
      const elapsed = last ? Math.min(64, now - last) : 16;
      position = reduce ? goal : position + (goal - position) * (1 - Math.exp(-elapsed / EASE_MS));
      if (Math.abs(goal - position) < 0.02) position = goal;
      prepare(Math.round(position));
      paint();
      updateChrome(progress);
      // Keep animating until the picture has caught up, then go idle.
      if (position !== goal) {
        last = now;
        frame = requestAnimationFrame(tick);
      } else {
        last = 0;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      fit();
      schedule();
    };

    const load = async (index: number) => {
      try {
        const response = await fetch(frameUrl(index, size));
        if (!response.ok) return;
        const file = await response.blob();
        if (cancelled) return;
        files[index] = file;
        prepare(Math.round(position));
      } catch {
        // A frame that fails to download is skipped; its neighbours stand in.
      }
    };
    const queue = loadOrder(FRAME_COUNT);
    const worker = async () => {
      while (queue.length > 0 && !cancelled) await load(queue.shift() as number);
    };
    for (let index = 0; index < PARALLEL_DOWNLOADS; index += 1) worker();

    measure();
    fit();
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      decoded.forEach(release);
      decoded.clear();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", onResize);
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
                      <i
                        ref={(element) => {
                          ticks.current[index] = element;
                        }}
                      />
                    </div>
                  ))}
                </div>
                <span>03</span>
              </div>
              <p ref={hint} className="eyebrow text-charcoal bg-ivory px-3 py-2 transition-opacity duration-700">
                Scroll to explore ↓
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
