import { ContactForm } from "@/components/site/ContactForm";
import { Hero } from "@/components/site/Hero";
import { Nav } from "@/components/site/Nav";
import { Projects } from "@/components/site/Projects";
import { ScrollEffects } from "@/components/site/ScrollEffects";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Solutions } from "@/components/site/Solutions";
import { Split } from "@/components/site/Split";
import { Testimonials } from "@/components/site/Testimonials";
import { getSite, uploadUrl } from "@/lib/api";
import { asset } from "@/lib/asset";

const DEMO = Boolean(process.env.DEMO_EXPORT);

const WHY = [
  ["Curated, not conventional.", "Distinctive European brands, materials, and finishes selected for design, quality, sustainability, and longevity."],
  ["Personal by design.", "Every project is shaped around the client, the architecture, and the way the space will be lived in."],
  ["One cohesive vision.", "Kitchens, bathrooms, closets, surfaces, and details considered together—not as separate elements."],
  ["Expertise in every detail.", "Knowledge, precision, and guidance from the first selection to the final design."],
];

const PROCESS = [
  ["Understand", "We begin with you—your space, your lifestyle, your needs, and the way you envision living in it."],
  ["Develop", "Ideas take shape through thoughtful planning, spatial layouts, material direction, and 3D visualization."],
  ["Refine", "Cabinetry, surfaces, finishes, fixtures, and details are carefully considered and refined into one cohesive vision."],
  ["Bring it to life", "With every decision in place, the vision becomes a space defined by precision, functionality, and enduring design."],
];

const MATERIALS = [
  ["Cabinetry", "European cabinetry in veneers, lacquers, and natural woods.", asset("/img/mat-cabinetry.webp"), ""],
  ["Fixtures", "Faucets, sinks, and hardware in bronze, nickel, and black.", asset("/img/mat-fixtures.webp"), "md:mt-24"],
  ["Architectural details", "Glass, wall panels, and finishing elements that complete the space.", asset("/img/mat-details.webp"), "md:mt-48"],
];

const pad = (n: number) => String(n + 1).padStart(2, "0");

export default async function Home() {
  const { settings, solutions, projects, testimonials, categories, brands, posts } = await getSite();
  const instagramUrl = `https://www.instagram.com/${settings.instagramHandle}/`;
  const brandGroups = categories
    .map((category) => ({ category, brands: brands.filter((brand) => brand.categoryId === category.id) }))
    .filter((group) => group.brands.length > 0);

  return (
    <>
      <ScrollEffects />
      <Nav home />
      <main id="top">
        <Hero />

        <Solutions solutions={solutions.map((solution) => ({ ...solution, image: uploadUrl(solution.image) }))} />

        {/* About */}
        <section id="about" className="bg-paper">
          <div className="hidden lg:block relative h-[100svh] min-h-[44rem]">
            <div className="sticky top-0 h-[100svh] overflow-hidden">
              <div
                className="absolute top-0 bottom-0 right-0 left-[calc(50%+2rem)] bg-cover bg-[position:78%_50%] bg-no-repeat"
                style={{ backgroundImage: `url(${asset("/img/about-interior.webp")})` }}
                role="img"
                aria-label="Kitchen with sage-green cabinetry, a blue stone backsplash and brass pendant lights"
              />
              <div className="shell h-full grid-12">
                <div className="col-span-5 grid h-full">
                  <div className="self-center">
                    <p className="eyebrow text-taupe-ink reveal">About Europa DC</p>
                    <h2 className="serif mt-6 ttl">
                      <Split lines={["Where thoughtful design", "meets exceptional", "craftsmanship."]} />
                    </h2>
                    <p className="mt-9 text-lead text-ink/80 max-w-[34rem] reveal">
                      Europa Design Center is a destination for refined, functional interiors. We bring together European
                      craftsmanship, premium materials, and personalized design solutions to create kitchens, bathrooms,
                      closets, and living spaces tailored to the way you live.
                    </p>
                    <p className="mt-5 text-[0.9375rem] leading-[1.7] text-ink/70 max-w-[34rem] reveal">
                      From the first idea to the final detail, our team guides every project with a focus on quality,
                      proportion, and timeless design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:hidden pt-20">
            <div className="shell">
              <p className="eyebrow text-taupe-ink">About Europa DC</p>
              <h2 className="serif mt-5 ttl">
                <Split lines={["Where thoughtful design meets exceptional craftsmanship."]} />
              </h2>
              <p className="mt-7 text-[1.0625rem] leading-[1.6] text-ink/80">
                Europa Design Center is a destination for refined, functional interiors. We bring together European
                craftsmanship, premium materials, and personalized design solutions to create kitchens, bathrooms, closets,
                and living spaces tailored to the way you live.
              </p>
              <p className="mt-4 text-[0.9375rem] leading-[1.7] text-ink/70">
                From the first idea to the final detail, our team guides every project with a focus on quality, proportion,
                and timeless design.
              </p>
            </div>
            <div
              className="mt-10 h-[72svh] w-full bg-cover bg-[position:78%_50%] bg-no-repeat"
              style={{ backgroundImage: `url(${asset("/img/about-interior.webp")})` }}
              role="img"
              aria-label="Kitchen with sage-green cabinetry, a blue stone backsplash and brass pendant lights"
            />
          </div>
          <div className="bg-charcoal text-ivory">
            <div className="shell pt-6 lg:pt-10">
              {[
                ["Our Vision", "To create interiors that feel considered, effortless, and uniquely personal."],
                ["Our Mission", "To transform ideas into beautifully designed spaces through thoughtful planning, exceptional materials, and attention to every detail."],
              ].map(([label, text], index) => (
                <div key={label} className={`grid-12 gap-y-6 py-12 lg:py-20 ${index === 0 ? "border-b border-white/15" : ""}`}>
                  <div className="col-span-12 lg:col-span-3 flex lg:flex-col items-baseline lg:items-start gap-5 lg:gap-6 reveal">
                    <span className="serif text-[3.5rem] lg:text-[5.5rem] leading-[0.8] text-[#B89A76]">{pad(index)}</span>
                    <p className="eyebrow text-stone">{label}</p>
                  </div>
                  <p className="col-span-12 lg:col-span-9 serif text-[clamp(2rem,4.2vw,4.5rem)] leading-[1.06] tracking-[-0.015em] text-ivory text-pretty">
                    <Split lines={[text]} />
                  </p>
                </div>
              ))}
              <div className="relative h-px bg-white/25" aria-hidden="true">
                <i className="absolute left-0 -top-[6px] h-[13px] w-px bg-[#B89A76]" />
                <i className="absolute right-0 -top-[6px] h-[13px] w-px bg-[#B89A76]" />
              </div>
            </div>
          </div>
        </section>

        <Projects
          projects={projects.map((project) => ({
            ...project,
            cover: uploadUrl(project.cover),
            gallery: project.gallery.map((name) => uploadUrl(name) as string),
          }))}
        />

        {/* Why */}
        <section id="why" className="py-section bg-charcoal text-ivory">
          <div className="shell">
            <div className="grid-12 gap-y-10">
              <p className="eyebrow text-stone col-span-12 -mb-3 lg:-mb-5 reveal">Why Europa DC</p>
              <h2 className="serif ttl col-span-12 lg:col-span-6">
                <Split lines={["A different standard", "of design."]} />
              </h2>
              <p className="serif col-span-12 lg:col-span-6 lg:col-start-7 lg:self-end text-[clamp(1.25rem,1.75vw,1.75rem)] leading-[1.4] reveal">
                Europa Design Center brings together exceptional design, European craftsmanship, and a carefully curated
                selection of materials to create interiors with lasting character.
              </p>
            </div>
            <div className="grid-12 mt-20 lg:mt-32 gap-y-12 items-start">
              <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-28">
                <div className="frame aspect-[4/5] !bg-ink reveal-img">
                  <img src={asset("/img/why.webp")} alt="Stone, light and shadow in a finished kitchen" loading="lazy" />
                </div>
              </div>
              <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
                {WHY.map(([title, text], index) => (
                  <li
                    key={title}
                    className={`why-item grid grid-cols-[4.5rem_1fr] md:grid-cols-[7rem_1fr] gap-x-6 py-10 lg:py-16 ${index === WHY.length - 1 ? "border-y" : "border-t"} border-line-light`}
                  >
                    <span className="serif text-[clamp(3rem,4.6vw,4.75rem)] leading-none text-bronze">{pad(index)}</span>
                    <div>
                      <h3 className="serif text-h2">{title}</h3>
                      <p className="mt-5 max-w-[30rem] text-[1rem] leading-[1.7] text-stone">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="lg:h-[240vh]">
          <div className="shell py-section lg:py-0 lg:sticky lg:top-0 lg:h-[100svh] lg:flex lg:flex-col lg:justify-center">
            <div className="grid-12 gap-y-8">
              <p className="eyebrow text-taupe-ink col-span-12 -mb-3 lg:-mb-5 reveal">Our process</p>
              <h2 className="serif ttl col-span-12 lg:col-span-7">
                <Split lines={["A clear path from", "concept to completion."]} />
              </h2>
              <p className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-end lg:justify-self-end text-[1rem] leading-[1.7] text-ink/75 reveal">
                Every project is approached with intention—bringing together your vision, our expertise, and carefully
                considered details.
              </p>
            </div>
            <ol id="ptl" className="mt-16 lg:mt-24 grid gap-0 lg:grid-cols-4 lg:gap-8 relative">
              <i id="pfill" className="hidden lg:block absolute left-0 right-0 top-0 h-px bg-charcoal origin-left z-[1]" style={{ transform: "scaleX(0)" }} />
              <i id="pfillv" className="lg:hidden absolute left-0 top-0 bottom-0 w-px bg-charcoal origin-top z-[1]" style={{ transform: "scaleY(0)" }} />
              {PROCESS.map(([title, text], index) => (
                <li
                  key={title}
                  className={`pstep relative pl-10 lg:pl-0 lg:pt-14 lg:border-l-0 lg:border-t ${index === PROCESS.length - 1 ? "border-l border-transparent lg:border-line" : "pb-14 lg:pb-0 border-l border-line"}`}
                >
                  <span className="pdot absolute -left-[5px] top-1 lg:left-0 lg:-top-[5px] h-[9px] w-[9px] rounded-full z-[2]" />
                  <p className="text-[0.75rem] tracking-[0.18em] text-taupe-ink">{pad(index)}</p>
                  <h3 className="serif mt-4 text-[clamp(2rem,2.8vw,3rem)] leading-[1.05]">{title}</h3>
                  <p className="mt-4 max-w-[20rem] text-[1rem] leading-[1.7] text-ink/75">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Brands and materials */}
        <section id="materials" className="pb-section">
          <div className="shell">
            <div className="grid-12 gap-y-8 border-t border-line pt-section">
              <p className="eyebrow text-taupe-ink col-span-12 -mb-3 lg:-mb-5 reveal">Brands &amp; materials</p>
              <h2 className="serif ttl col-span-12 lg:col-span-7">
                <Split lines={["Defined by what goes", "into every detail."]} />
              </h2>
              <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-end lg:justify-self-end lg:w-[28.2rem] lg:max-w-full flex flex-col gap-4 text-[1rem] leading-[1.7] text-ink/75 reveal">
                <p>
                  We partner with distinguished European brands and carefully selected manufacturers known for exceptional
                  design, craftsmanship, innovation, and sustainability.
                </p>
                <p>
                  From cabinetry and surfaces to fixtures, finishes, and architectural materials, every element is selected
                  for its quality, performance, and ability to stand the test of time.
                </p>
              </div>
            </div>
            <div className="mt-16 lg:mt-24 grid-12 gap-y-10 items-stretch">
              <div id="dekton-panel" className="tactile col-span-12 lg:col-span-8 relative min-h-[28rem] lg:min-h-[44rem] bg-charcoal reveal-img">
                <div className="tex" style={{ backgroundImage: `url(${asset("/img/dekton-texture.jpg")})` }} />
                <div className="absolute left-0 bottom-0 bg-ivory p-6 md:p-10 max-w-[30rem] z-[1]">
                  <p className="eyebrow text-taupe-ink">Surfaces · Featured</p>
                  <h3 className="serif mt-4 text-[clamp(3rem,5.4vw,5.5rem)] leading-none">
                    Dekton<sup className="text-[0.4em] align-super">®</sup>
                  </h3>
                  <p className="mt-5 text-[0.9375rem] leading-[1.7] text-ink/75">
                    The ultracompact surface in our hero kitchen. Countertops, waterfall islands, and full-height backsplashes
                    in a single, continuous material.
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex col-span-12 lg:col-span-4 flex-col justify-between gap-10">
                <div className="frame aspect-[4/3] lg:aspect-auto lg:flex-1 reveal-img">
                  <img src={asset("/img/mat-dekton-detail.webp")} alt="Dekton slab detail" loading="lazy" />
                </div>
                <p className="text-[0.9375rem] leading-[1.7] text-ink/75 reveal">
                  Seen at the showroom in full slabs, so finish, veining, and edge details can be judged at true scale.
                </p>
              </div>
            </div>
            <div className="mat-row mt-20 lg:mt-28 flex md:grid gap-4 md:grid-cols-3 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-[var(--spacing-gutter)] px-[var(--spacing-gutter)] md:mx-0 md:px-0">
              {MATERIALS.map(([title, text, image, offset]) => (
                <div key={title} className={`reveal shrink-0 w-[78%] md:w-auto snap-start scroll-ml-[var(--spacing-gutter)] ${offset}`}>
                  <div className="frame aspect-[4/5] reveal-img zoom">
                    <img src={image} alt="" loading="lazy" />
                  </div>
                  <p className="eyebrow text-taupe-ink mt-6">{title}</p>
                  <p className="serif mt-3 text-[1.625rem] leading-tight">{text}</p>
                </div>
              ))}
            </div>
            {brandGroups.length > 0 && (
              <div className="mt-20 lg:mt-28 border-t border-line">
                {brandGroups.map(({ category, brands: list }) => (
                  <div key={category.id} className="grid-12 gap-y-3 py-8 lg:py-10 border-b border-line reveal">
                    <p className="eyebrow text-taupe-ink col-span-12 lg:col-span-3 pt-3">{category.name}</p>
                    <ul className="col-span-12 lg:col-span-9 flex flex-wrap items-center gap-x-10 gap-y-4 serif text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none">
                      {list.map((brand) => {
                        const logo = uploadUrl(brand.logo);
                        const content = logo ? <img src={logo} alt={brand.name} className="h-[1.1em] w-auto max-w-[9rem] object-contain" /> : brand.name;
                        return (
                          <li key={brand.id}>
                            {brand.url ? (
                              <a href={brand.url} target="_blank" rel="noreferrer">
                                {content}
                              </a>
                            ) : (
                              content
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Testimonials testimonials={testimonials} />

        {/* Showroom */}
        <section id="showroom" className="relative">
          <div id="sr-frame" className="frame aspect-[5/3] lg:aspect-auto lg:h-[100svh]">
            <img src={asset("/img/showroom.webp")} alt="The Europa DC showroom kitchen" loading="lazy" />
          </div>
          <div className="shell relative -mt-10 md:-mt-40 lg:-mt-72 pointer-events-none">
            <div className="grid-12">
              <div className="col-span-12 md:col-span-9 lg:col-span-6 bg-ivory p-8 md:p-14 pointer-events-auto reveal">
                <p className="eyebrow text-taupe-ink">Showroom · Glendale, California</p>
                <h2 className="serif mt-6 ttl">
                  Where ideas
                  <br className="hidden md:inline" /> become tangible.
                </h2>
                <div className="mt-6 flex flex-col gap-4 text-lead text-ink/75">
                  <p>
                    Experience Europa Design Center in person. Explore our curated collections, discover materials and
                    finishes, and see how every element can come together to shape your space.
                  </p>
                  <p>Our design team is here to guide you, inspire you, and help turn your vision into something uniquely yours.</p>
                </div>
                {(settings.address || settings.hours) && (
                  <div className="mt-8 grid sm:grid-cols-2 gap-6 text-[0.9375rem] leading-[1.7] text-ink/75">
                    {settings.address && (
                      <div>
                        <p className="eyebrow text-taupe-ink mb-2">Address</p>
                        <address className="not-italic whitespace-pre-line">{settings.address}</address>
                      </div>
                    )}
                    {settings.hours && (
                      <div>
                        <p className="eyebrow text-taupe-ink mb-2">Hours</p>
                        <p className="whitespace-pre-line">{settings.hours}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-10 grid grid-cols-1 gap-3 [&>.btn]:w-full">
                  {settings.mapUrl && (
                    <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="btn btn-line">
                      Visit Our Showroom <span className="arrow">→</span>
                    </a>
                  )}
                  <a href="#contact" className="btn btn-dark">
                    Schedule a Design Consultation <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram */}
        <section id="instagram" className="py-section bg-charcoal text-ivory">
          <div className="shell">
            <div className="grid-12 gap-y-8">
              <p className="eyebrow text-stone col-span-12 -mb-3 lg:-mb-5 reveal">Instagram</p>
              <div className="col-span-12 lg:col-span-9 flex items-center gap-4 lg:gap-6">
                <svg
                  className="shrink-0 reveal"
                  style={{ width: "clamp(2.25rem,3.2vw,3.5rem)", height: "clamp(2.25rem,3.2vw,3.5rem)" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                  <circle cx="12" cy="12" r="4.25" />
                  <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                <h2 className="serif ttl">
                  <Split lines={[`@${settings.instagramHandle}`]} />
                </h2>
              </div>
            </div>
            {posts.length > 0 ? (
              <div className="mt-14 lg:mt-20 ig-row flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-[var(--spacing-gutter)] px-[var(--spacing-gutter)] md:mx-0 md:px-0">
                {posts.slice(0, 8).map((post, index) => (
                  <a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="ig-post relative block shrink-0 w-[72%] md:w-auto snap-start scroll-ml-[var(--spacing-gutter)] overflow-hidden bg-white/5 aspect-[4/5] reveal"
                    style={{ transitionDelay: `${index * 70}ms` }}
                    aria-label={post.caption ? post.caption.slice(0, 90) : `Europa DC on Instagram, post ${index + 1}`}
                  >
                    <img src={post.image} alt="" loading="lazy" />
                    <span className="ig-ov absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                        <circle cx="12" cy="12" r="4.25" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-14 lg:mt-20 max-w-[34rem] text-[1rem] leading-[1.7] text-stone reveal">
                Finished projects, materials and showroom updates, as they happen.
              </p>
            )}
            <div className="mt-10 lg:mt-14 grid-12">
              <div className="col-span-12 lg:col-start-7 lg:col-span-6 flex lg:justify-end">
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="tlink">
                  Follow Europa DC on Instagram <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="relative overflow-hidden py-section bg-paper border-t border-line">
          <div className="shell relative max-md:!px-4">
            <div className="grid-12 gap-y-12">
              <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-28 self-start">
                <p className="eyebrow text-taupe-ink reveal">Start Your Project</p>
                <h2 className="serif ttl mt-6 lg:mt-8">
                  <Split lines={["Ready to create a space", "that feels like yours?"]} />
                </h2>
                <p className="mt-6 lg:mt-8 max-w-[26rem] text-lead text-ink/75 reveal">
                  Tell us a little about your project and our team will be in touch.
                </p>
                {(settings.phone || settings.email) && (
                  <div className="mt-8 flex flex-col gap-1 text-[0.9375rem] text-ink/75 reveal">
                    {settings.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a>}
                    {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
                  </div>
                )}
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7 reveal">
                <ContactForm disabled={DEMO} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} rooms={solutions} home />
    </>
  );
}
