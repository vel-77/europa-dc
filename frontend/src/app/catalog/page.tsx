import type { Metadata } from "next";
import Link from "next/link";
import { CatalogCta } from "@/components/catalog/CatalogCta";
import { RoomSwitcher } from "@/components/catalog/RoomSwitcher";
import { Nav } from "@/components/site/Nav";
import { ScrollEffects } from "@/components/site/ScrollEffects";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Split } from "@/components/site/Split";
import { getCatalog, getSite, uploadUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Catalog | Europa Design Center",
  description: "Kitchens, bathrooms, closets, outdoor spaces, surfaces and details designed and installed by Europa DC in Glendale.",
};

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default async function CatalogPage() {
  const [{ settings, solutions: rooms }, items] = await Promise.all([getSite(), getCatalog()]);
  const count = (roomId: string) => items.filter((item) => item.roomId === roomId).length;

  return (
    <>
      <ScrollEffects />
      <Nav />
      <main>
        <RoomSwitcher rooms={rooms} />
        <section className="pt-12 lg:pt-20 pb-section">
          <div className="shell">
            <div className="grid-12 gap-y-6 items-end">
              <div className="col-span-12 lg:col-span-7">
                <p className="eyebrow text-taupe-ink reveal">Catalog</p>
                <h1 className="serif ttl mt-5 lg:mt-6">
                  <Split lines={["Explore by room."]} />
                </h1>
              </div>
              <p className="col-span-12 lg:col-span-5 text-lead text-ink/80 reveal">
                Kitchens, bathrooms, closets and more. Every design can be adapted to your space; ask us about any of them.
              </p>
            </div>

            <ul className="mt-14 lg:mt-20 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, index) => {
                const image = uploadUrl(room.image);
                const designs = count(room.id);
                return (
                  <li key={room.id} className="reveal">
                    <Link href={`/catalog/${room.slug}`} className="group block">
                      <div className="frame aspect-[4/5] zoom">{image && <img src={image} alt="" loading={index < 3 ? "eager" : "lazy"} />}</div>
                      <div className="mt-6 flex items-baseline justify-between gap-4">
                        <h2 className="serif text-[clamp(1.75rem,2.4vw,2.25rem)] leading-[1.05] group-hover:text-bronze transition-colors">
                          {room.title}
                        </h2>
                        <span className="text-[0.75rem] tracking-[0.18em] text-taupe-ink">{pad(index)}</span>
                      </div>
                      <p className="mt-2 text-[0.9375rem] text-ink/70">{room.description}</p>
                      <p className="mt-4 text-[0.875rem] font-medium">
                        {designs === 0 ? "View room" : `${designs} design${designs === 1 ? "" : "s"}`} <span className="arrow">→</span>
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        <CatalogCta />
      </main>
      <SiteFooter settings={settings} rooms={rooms} />
    </>
  );
}
