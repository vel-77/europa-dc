"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

const LINKS = [
  ["#projects", "Projects"],
  ["#solutions", "Solutions"],
  ["#about", "About"],
  ["#materials", "Brands"],
  ["#showroom", "Showroom"],
  ["#contact", "Contact"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header id="nav" className="fixed inset-x-0 top-0 z-50 transition-colors duration-700">
        <div className="shell flex h-20 lg:h-15 items-center justify-between gap-6">
          <a href="#top" className="flex items-center" aria-label="Europa Design Center, back to top">
            <img src={asset("/europa-logo-black.png")} alt="Europa DC Inc." className="h-9 lg:h-10 w-auto" />
          </a>
          <nav className="hidden lg:flex items-center gap-9 text-[0.8125rem] text-ink" aria-label="Sections">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a href="#contact" className="btn btn-ghost hidden md:inline-flex">
              Book a Consultation
            </a>
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
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="serif text-[2.5rem] leading-none border-b border-line py-5" onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a href="#contact" className="btn btn-dark mt-10" onClick={() => setOpen(false)}>
            Book a Consultation <span className="arrow">→</span>
          </a>
        </nav>
      </div>
    </>
  );
}
