import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Settings, Solution } from "@/lib/types";

/** Site footer. On the home page its links scroll within the page; elsewhere they lead home. */
export function SiteFooter({ settings, rooms, home = false }: { settings: Settings; rooms: Solution[]; home?: boolean }) {
  const section = (hash: string) => (home ? hash : `/${hash}`);
  const instagramUrl = `https://www.instagram.com/${settings.instagramHandle}/`;

  return (
    <footer className="bg-charcoal text-ivory">
      <div className="shell border-t border-line-light pt-5 pb-5 md:pt-16 md:pb-10">
        <div className="grid-12 gap-y-5 md:gap-y-12">
          <div className="col-span-12 lg:col-span-5 max-md:pb-5 max-md:border-b max-md:border-line-light">
            <img src={asset("/europa-logo-white.png")} alt="Europa DC Inc." className="h-11 md:h-16 w-auto" />
            <Link href={section("#contact")} className="tlink mt-4 md:mt-8">
              Book a Consultation <span className="arrow">→</span>
            </Link>
          </div>
          <nav
            className="col-span-6 max-md:row-span-2 md:col-span-4 lg:col-span-2 lg:col-start-7 flex flex-col gap-2 md:gap-3 text-[0.9375rem] text-stone"
            aria-label="Footer"
          >
            <p className="eyebrow text-taupe md:hidden">Explore</p>
            <Link href={section("#projects")}>Projects</Link>
            <Link href={section("#solutions")}>Solutions</Link>
            <Link href="/catalog">Catalog</Link>
            <Link href={section("#about")}>About</Link>
            <Link href={section("#materials")}>Brands</Link>
            <Link href={section("#showroom")}>Showroom</Link>
            <Link href={section("#contact")}>Contact</Link>
          </nav>
          <div className="col-span-6 md:col-span-4 lg:col-span-2 flex flex-col gap-2 md:gap-3 text-[0.9375rem] text-stone">
            <p className="eyebrow text-taupe">Showroom</p>
            <address className="not-italic leading-[1.7] whitespace-pre-line">{settings.address}</address>
            {settings.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a>}
          </div>
          <div className="col-span-6 md:col-span-4 lg:col-span-2 flex flex-col gap-2 md:gap-3 text-[0.9375rem] text-stone">
            <p className="eyebrow text-taupe">Follow</p>
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
            {settings.email && <a href={`mailto:${settings.email}`}>Email</a>}
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-line-light md:border-0 md:pt-0 md:mt-20 flex flex-col md:flex-row md:flex-wrap md:justify-between gap-2 md:gap-4 text-[0.75rem] leading-[1.6] text-taupe">
          <p>
            © {new Date().getFullYear()} {settings.siteName}
          </p>
          <p>
            {rooms.map((room, index) => (
              <span key={room.id}>
                {index > 0 && " · "}
                <Link href={`/catalog/${room.slug}`} className="hover:text-stone">
                  {room.title}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
