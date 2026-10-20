"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

// Sections of the home page; `null` marks the separate catalog page.
const LINKS = [
  ["#projects", "Projects"],
  ["#solutions", "Solutions"],
  [null, "Catalog"],
  ["#about", "About"],
  ["#materials", "Brands"],
  ["#showroom", "Showroom"],
  ["#contact", "Contact"],
] as const;

/**
 * Site header. On the home page it starts transparent over the hero and its
 * links scroll within the page; elsewhere it is solid and links lead home.
 */
export function Nav({ home = false }: { home?: boolean }) {
  const href = (hash: string | null) => (hash === null ? "/catalog" : home ? hash : `/${hash}`);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        id="nav"
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-700 ${home ? "" : "bg-ivory/95 border-b border-line"}`}
      >
        <div className="shell flex h-20 items-center justify-between gap-6">
          <Link href={home ? "#top" : "/"} className="flex shrink-0 items-center" aria-label={home ? "Europa Design Center, back to top" : "Europa Design Center home"}>
            <img src={asset("/europa-logo-black.png")} alt="Europa DC Inc." className="h-12 lg:h-14 w-auto" />
          </Link>
          <nav className="hidden lg:flex items-center gap-6 xl:gap-9 text-[0.9375rem] text-ink" aria-label="Sections">
            {LINKS.map(([hash, label]) => (
              <Link key={label} href={href(hash)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href={href("#contact")} className="btn btn-ghost btn-lg text-[1rem] hidden md:inline-flex">
              Book a Consultation
            </Link>
            <button
              type="button"
              className="lg:hidden flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span className="block h-px w-6 bg-charcoal" />
              <span className="block h-px w-6 bg-charcoal" />
              <span className="block h-px w-6 bg-charcoal" />
            </button>
          </div>
        </div>
      </header>
      <div id="menu" className={`fixed inset-0 z-40 bg-ivory pt-24 ${open ? "" : "hidden"}`}>
        <nav className="shell flex flex-col" aria-label="Sections">
          {LINKS.map(([hash, label]) => (
            <Link key={label} href={href(hash)} className="serif text-[2.5rem] leading-none border-b border-line py-5" onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href={href("#contact")} className="btn btn-dark mt-10" onClick={() => setOpen(false)}>
            Book a Consultation <span className="arrow">→</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
