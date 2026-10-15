"use client";

import { useEffect, useRef, useState } from "react";

const pad = (n: number) => String(n + 1).padStart(2, "0");

type Props = {
  title: string;
  /** Short lines under the title, joined with a dot; empty ones are skipped. */
  subtitle: string[];
  photos: string[];
  closeLabel: string;
  /** Optional row between the header and the photos, e.g. a description. */
  children?: React.ReactNode;
  onClose: () => void;
};

/** A full-screen photo gallery for a project or catalog item. */
export function GalleryDialog({ title, subtitle, photos, closeLabel, children, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 260);
  };
  const go = (next: number) => setIndex((next + photos.length) % photos.length);

  return (
    <dialog
      ref={dialog}
      className={`pm ${closing ? "out" : ""}`}
      aria-labelledby="pm-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => event.target === dialog.current && close()}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        if (event.key === "ArrowRight") go(index + 1);
      }}
    >
      <div className={`pm-in ${children ? "has-body" : ""}`}>
        <div className="flex items-start justify-between gap-6 px-5 py-4 lg:px-8 lg:py-6 border-b border-line">
          <div className="min-w-0">
            <h3 id="pm-title" className="serif text-[1.375rem] lg:text-[1.875rem] leading-[1.05] uppercase tracking-[0.02em]">
              {title}
            </h3>
            <p className="mt-2 eyebrow text-taupe-ink">
              {subtitle
                .filter(Boolean)
                .map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {lineIndex > 0 && <span className="text-ink/40"> · </span>}
                    {line}
                  </span>
                ))}
            </p>
          </div>
          <button
            type="button"
            className="pm-x shrink-0 flex items-center justify-center w-11 h-11 rounded-[2px] border border-line hover:bg-ink hover:text-ivory transition-colors"
            aria-label={closeLabel}
            onClick={close}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M3 3l12 12M15 3L3 15" />
            </svg>
          </button>
        </div>
        {children}
        <div className="pm-stage relative overflow-hidden bg-charcoal">
          {photos.map((photo, photoIndex) => (
            <div key={photo} className={`pm-s ${photoIndex === index ? "on" : ""}`}>
              <img src={photo} alt={`${title}, photo ${photoIndex + 1}`} />
            </div>
          ))}
          {photos.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-stone text-sm">Photos coming soon.</p>}
          {photos.length > 1 && (
            <>
              <button type="button" className="pm-arw left-3 lg:left-5" aria-label="Previous image" onClick={() => go(index - 1)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M11 3L5 9l6 6" />
                </svg>
              </button>
              <button type="button" className="pm-arw right-3 lg:right-5" aria-label="Next image" onClick={() => go(index + 1)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M7 3l6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-3 lg:px-8 lg:py-4">
          <div className="flex gap-2 lg:gap-3 overflow-x-auto">
            {photos.map((photo, photoIndex) => (
              <button
                key={photo}
                type="button"
                className={`pm-t has ${photoIndex === index ? "on" : ""}`}
                style={{ backgroundImage: `url("${photo}")` }}
                aria-label={`Show image ${photoIndex + 1}`}
                aria-current={photoIndex === index ? "true" : undefined}
                onClick={() => go(photoIndex)}
              >
                <span>{pad(photoIndex)}</span>
              </button>
            ))}
          </div>
          <p className="shrink-0 text-[0.8125rem] tracking-[0.18em] text-ink/70" aria-live="polite">
            <span className="text-ink">{pad(index)}</span> / {String(photos.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </dialog>
  );
}
