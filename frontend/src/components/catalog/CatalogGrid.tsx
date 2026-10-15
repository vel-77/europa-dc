"use client";

import Link from "next/link";
import { useState } from "react";
import { GalleryDialog } from "@/components/site/GalleryDialog";

export type CatalogItemView = {
  id: string;
  title: string;
  details: string;
  description: string;
  cover: string | null;
  gallery: string[];
};

/** A room's designs; each opens a gallery with its description and a way to ask about it. */
export function CatalogGrid({ items, projectType }: { items: CatalogItemView[]; projectType: string }) {
  const [open, setOpen] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="mt-14 lg:mt-20 border-y border-line py-12 max-w-[40rem]">
        <p className="serif text-h3">There are no designs in this room yet.</p>
        <p className="mt-4 text-[1rem] leading-[1.7] text-ink/75">
          Tell us what you have in mind and our team will put options together for you.
        </p>
        <Link href={{ pathname: "/", query: { type: projectType }, hash: "contact" }} className="btn btn-dark mt-8">
          Start Your Project <span className="arrow">→</span>
        </Link>
      </div>
    );
  }

  const item = open === null ? null : items[open];
  const photos = item ? [item.cover, ...item.gallery].filter((photo): photo is string => Boolean(photo)) : [];

  return (
    <>
      <ul className="mt-14 lg:mt-20 grid gap-x-6 gap-y-12 lg:gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {items.map((entry, index) => (
          <li key={entry.id} className="reveal">
            <button type="button" className="group block w-full text-left" aria-haspopup="dialog" onClick={() => setOpen(index)}>
              <div className="frame aspect-[4/5] zoom">
                {entry.cover && <img src={entry.cover} alt="" loading={index < 3 ? "eager" : "lazy"} />}
              </div>
              <h2 className="serif mt-5 text-[1.625rem] leading-tight group-hover:text-bronze transition-colors">{entry.title}</h2>
              {entry.details && <p className="mt-2 text-[0.8125rem] leading-[1.5] text-taupe-ink">{entry.details}</p>}
            </button>
          </li>
        ))}
      </ul>

      {item && (
        <GalleryDialog title={item.title} subtitle={[item.details]} photos={photos} closeLabel="Close design" onClose={() => setOpen(null)}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 px-5 py-4 lg:px-8 border-b border-line">
            {item.description && <p className="max-w-[44rem] text-[0.9375rem] leading-[1.6] text-ink/80">{item.description}</p>}
            <Link
              href={{ pathname: "/", query: { type: projectType, about: item.title }, hash: "contact" }}
              className="btn btn-dark shrink-0 self-start md:self-auto"
            >
              Ask about this design <span className="arrow">→</span>
            </Link>
          </div>
        </GalleryDialog>
      )}
    </>
  );
}
