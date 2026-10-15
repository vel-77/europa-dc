"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Room = { id: string; title: string; slug: string };

/** Tabs for moving between rooms; sticks under the header while scrolling. */
export function RoomSwitcher({ rooms, current }: { rooms: Room[]; current?: string }) {
  const list = useRef<HTMLUListElement>(null);

  // On narrow screens the tabs scroll sideways; bring the current one into view.
  useEffect(() => {
    const container = list.current;
    const active = container?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!container || !active) return;
    container.scrollLeft = active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2;
  }, [current]);

  const tab = (active: boolean) =>
    `block whitespace-nowrap py-4 border-b-2 text-[0.875rem] transition-colors ${
      active ? "border-charcoal text-charcoal" : "border-transparent text-taupe-ink hover:text-charcoal"
    }`;

  return (
    <nav aria-label="Rooms" className="sticky top-20 lg:top-15 z-30 mt-20 lg:mt-15 bg-ivory/95 border-b border-line">
      <ul ref={list} className="shell flex gap-7 lg:gap-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li>
          <Link href="/catalog" className={tab(!current)} aria-current={!current ? "page" : undefined}>
            All rooms
          </Link>
        </li>
        {rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/catalog/${room.slug}`} className={tab(room.slug === current)} aria-current={room.slug === current ? "page" : undefined}>
              {room.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
