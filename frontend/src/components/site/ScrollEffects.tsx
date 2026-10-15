"use client";

import { useEffect } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Page-wide motion that only reads the DOM: reveals on scroll-in (marked with
 * a data-in attribute), the lit principle in "Why", the process timeline, the
 * showroom frame and the nav background. Sections that keep state have their
 * own components.
 */
export function ScrollEffects() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // An attribute rather than a class: React rewrites className when a
            // component re-renders, which would hide the element again.
            (entry.target as HTMLElement).dataset.in = "";
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    document.querySelectorAll(".reveal,.reveal-img,.split").forEach((element) => observer.observe(element));

    const nav = document.getElementById("nav");
    const hero = document.getElementById("hero");
    const whyItems = Array.from(document.querySelectorAll<HTMLElement>(".why-item"));
    const process = document.getElementById("process");
    const timeline = document.getElementById("ptl");
    const steps = Array.from(document.querySelectorAll<HTMLElement>(".pstep"));
    const fill = document.getElementById("pfill");
    const fillVertical = document.getElementById("pfillv");
    const showroom = document.getElementById("sr-frame");
    const showroomImage = showroom?.querySelector("img");

    let frame = 0;
    let navSolid: boolean | null = null;
    const update = () => {
      frame = 0;
      // Read all positions first, then write: interleaving the two makes the
      // browser recalculate the layout several times per frame.
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      const whyBoxes = whyItems.map((item) => item.getBoundingClientRect());
      const desktop = innerWidth >= 1024;
      const processBox = process && timeline ? (desktop ? process : timeline).getBoundingClientRect() : null;
      const showroomBox = showroom && !reduce ? showroom.getBoundingClientRect() : null;

      if (nav && hero) {
        const solid = heroBottom < 80;
        if (solid !== navSolid) {
          navSolid = solid;
          nav.style.background = solid ? "rgb(245 241 234 / 0.96)" : "transparent";
          nav.style.borderBottom = solid ? "1px solid rgb(30 28 26 / 0.08)" : "1px solid transparent";
        }
      }

      let nearest = -1;
      let distance = Infinity;
      whyBoxes.forEach((box, index) => {
        const d = Math.abs(box.top + box.height / 2 - innerHeight / 2);
        if (d < distance) {
          distance = d;
          nearest = index;
        }
      });
      whyItems.forEach((item, index) => item.classList.toggle("act", reduce || index === nearest));

      if (processBox && fill && fillVertical) {
        let progress = desktop
          ? clamp01((-processBox.top / (processBox.height - innerHeight)) * 1.15)
          : clamp01((innerHeight * 0.7 - processBox.top) / processBox.height);
        if (reduce) progress = 1;
        fill.style.transform = `scaleX(${progress})`;
        fillVertical.style.transform = `scaleY(${progress})`;
        steps.forEach((step, index) => step.classList.toggle("act", progress >= index / steps.length + 0.02 || progress >= 0.999));
      }

      if (showroom && showroomBox) {
        const opened = clamp01(1 - showroomBox.top / innerHeight);
        showroom.style.clipPath = `inset(${((1 - opened) * 6).toFixed(2)}% ${((1 - opened) * 8).toFixed(2)}%)`;
        if (showroomImage && desktop) {
          const centre = (showroomBox.top + showroomBox.height / 2 - innerHeight / 2) / innerHeight;
          showroomImage.style.transform = `scale(${(1.06 + Math.max(0, centre) * 0.1).toFixed(4)}) translateY(${(centre * -3).toFixed(3)}%)`;
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);

    // Dekton panel: the stone shifts under the cursor.
    const panel = document.getElementById("dekton-panel");
    const texture = panel?.querySelector<HTMLElement>(".tex");
    const onMove = (event: MouseEvent) => {
      if (!panel || !texture) return;
      const box = panel.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      texture.style.transform = `scale(1.06) translate(${(-x * 2.4).toFixed(2)}%, ${(-y * 2.4).toFixed(2)}%)`;
    };
    const onLeave = () => {
      if (texture) texture.style.transform = "";
    };
    if (panel && !reduce) {
      panel.addEventListener("mousemove", onMove);
      panel.addEventListener("mouseleave", onLeave);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      panel?.removeEventListener("mousemove", onMove);
      panel?.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return null;
}
