import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogCta } from "@/components/catalog/CatalogCta";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { RoomSwitcher } from "@/components/catalog/RoomSwitcher";
import { Nav } from "@/components/site/Nav";
import { ScrollEffects } from "@/components/site/ScrollEffects";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Split } from "@/components/site/Split";
import { getCatalog, getSite, uploadUrl } from "@/lib/api";
import { projectTypeFor } from "@/lib/project-types";

// The static demo is built ahead of time, one page per room. The live site
// leaves this out so each room renders on request and admin changes show at
// once (returning an empty list instead would cache pages after first visit).
export const generateStaticParams = process.env.DEMO_EXPORT
  ? async () => (await getSite()).solutions.map((room) => ({ slug: room.slug }))
  : undefined;

export async function generateMetadata({ params }: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const room = (await getSite()).solutions.find((entry) => entry.slug === slug);
  if (!room) return { title: "Catalog | Europa Design Center" };
  return { title: `${room.title} | Catalog | Europa Design Center`, description: room.intro || room.description };
}

export default async function RoomCatalogPage({ params }: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const [{ settings, solutions: rooms }, items] = await Promise.all([getSite(), getCatalog()]);
  const room = rooms.find((entry) => entry.slug === slug);
  if (!room) notFound();

  const designs = items
    .filter((item) => item.roomId === room.id)
    .map((item) => ({
      ...item,
      cover: uploadUrl(item.cover),
      gallery: item.gallery.map((name) => uploadUrl(name) as string),
    }));

  return (
    <>
      {/* Keyed by room so switching rooms replays the reveal animations for the new content. */}
      <ScrollEffects key={room.slug} />
      <Nav />
      <main key={room.slug}>
        <RoomSwitcher rooms={rooms} current={room.slug} />
        <section className="pt-12 lg:pt-20 pb-section">
          <div className="shell">
            <div className="grid-12 gap-y-6 items-end">
              <div className="col-span-12 lg:col-span-7">
                <p className="eyebrow text-taupe-ink reveal">
                  Catalog · {designs.length} design{designs.length === 1 ? "" : "s"}
                </p>
                <h1 className="serif ttl mt-5 lg:mt-6">
                  <Split lines={[room.title]} />
                </h1>
              </div>
              <p className="col-span-12 lg:col-span-5 text-lead text-ink/80 reveal">{room.intro || room.description}</p>
            </div>
            <CatalogGrid items={designs} projectType={projectTypeFor(room.title)} />
          </div>
        </section>
        <CatalogCta />
      </main>
      <SiteFooter settings={settings} rooms={rooms} />
    </>
  );
}
