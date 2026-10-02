import { KitchenBuild, type BuildStage } from "@/components/kitchen/KitchenBuild";
import { getSite } from "@/lib/api";

export default async function Home() {
  const { settings, categories, brands, posts } = await getSite();

  const brandGroups = categories
    .map((category) => ({ category, brands: brands.filter((brand) => brand.categoryId === category.id) }))
    .filter((group) => group.brands.length > 0);
  const brandNames = (categoryId: string) =>
    brandGroups.find((group) => group.category.id === categoryId)?.brands.map((brand) => brand.name);

  const stages: BuildStage[] = [
    { label: "Layout", title: settings.heroTitle, text: settings.heroText },
    {
      label: "Cabinets",
      title: "Cabinets",
      text: "Custom European cabinetry for kitchens, closets and vanities. The tall units, base run and island are set out first.",
      brands: brandNames("cabinets"),
    },
    {
      label: "Stonework",
      title: "Stonework",
      text: "Countertops, flooring, wall cladding and fireplaces. Here the stone runs up the wall and down the end of the island.",
      brands: brandNames("stonework"),
    },
    {
      label: "Appliances",
      title: "Appliances",
      text: "Ovens, cooktop and ventilation, built in flush with the cabinetry.",
      brands: brandNames("appliances"),
    },
    {
      label: "Plumbing",
      title: "Plumbing fixtures",
      text: "The sink and faucet go in once the stone is cut.",
      brands: brandNames("plumbing-fixtures"),
    },
    {
      label: "Hardware",
      title: "Hardware",
      text: "Custom handles and pulls: the part of the kitchen you touch every day.",
      brands: brandNames("hardware"),
    },
    {
      label: "Doors and panels",
      title: "Doors and panels",
      text: "Interior and exterior doors, and decorative panels such as the fluted front on this island.",
      brands: brandNames("doors"),
    },
    {
      label: "Showroom",
      title: "Then we build it.",
      text: "See the cabinetry, stone and appliances in person at our Glendale showroom.",
    },
  ];

  const instagramUrl = `https://www.instagram.com/${settings.instagramHandle}/`;
  const phoneHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <a className="skip-link" href="#services">
        Skip to services
      </a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label={`${settings.siteName}, back to top`}>
          Europa <span>DC</span>
        </a>
        <nav aria-label="Sections">
          <a href="#services">Services</a>
          <a href="#brands">Brands</a>
          <a href="#instagram">Instagram</a>
          <a href="#visit">Visit</a>
        </nav>
        {settings.phone && (
          <a className="site-header-phone" href={phoneHref}>
            {settings.phone}
          </a>
        )}
      </header>

      <main id="top">
        {/* Without JavaScript nothing drives the drawing, so show it finished. */}
        <noscript>
          <style>{`.build-drawing path{stroke-dashoffset:0;visibility:visible}.build-drawing polygon,.build-drawing text{opacity:1}`}</style>
        </noscript>
        <KitchenBuild
          stages={stages}
          hint="Scroll to watch one take shape."
          cta={{ label: "Plan a showroom visit", href: "#visit" }}
        />

        <section className="section" id="services" aria-labelledby="services-title">
          <h2 id="services-title" className="section-title">
            One design center for the whole room
          </h2>
          <ul className="services">
            {categories.map((category) => (
              <li key={category.id}>
                <h3>{category.name}</h3>
                <p>{category.blurb}</p>
                {category.items.length > 0 && (
                  <ul>
                    {category.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        {brandGroups.length > 0 && (
          <section className="section" id="brands" aria-labelledby="brands-title">
            <h2 id="brands-title" className="section-title">
              Brands we carry
            </h2>
            {brandGroups.map(({ category, brands: list }) => (
              <div className="brand-group" key={category.id}>
                <h3>{category.name}</h3>
                <ul>
                  {list.map((brand) => {
                    const content = brand.logo ? <img src={`/uploads/${brand.logo}`} alt={brand.name} /> : brand.name;
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
          </section>
        )}

        <section className="section" id="instagram" aria-labelledby="instagram-title">
          <div className="section-head">
            <h2 id="instagram-title" className="section-title">
              Recent work
            </h2>
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              @{settings.instagramHandle} on Instagram
            </a>
          </div>
          {posts.length > 0 ? (
            <ul className="posts">
              {posts.map((post) => (
                <li key={post.id}>
                  <a href={post.permalink} target="_blank" rel="noreferrer">
                    <img
                      src={post.image}
                      alt={post.caption ? post.caption.slice(0, 140) : "Instagram post by Europa DC"}
                      loading="lazy"
                    />
                    {post.isVideo && <span className="posts-video">Video</span>}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="posts-empty">
              We post finished projects, materials and showroom updates on Instagram.{" "}
              <a href={instagramUrl} target="_blank" rel="noreferrer">
                See the latest posts
              </a>
            </p>
          )}
        </section>

        <section className="visit" id="visit" aria-labelledby="visit-title">
          <h2 id="visit-title">Visit the showroom</h2>
          <div className="visit-grid">
            {settings.address && (
              <div>
                <h3>Address</h3>
                <address>{settings.address}</address>
                {settings.mapUrl && (
                  <a href={settings.mapUrl} target="_blank" rel="noreferrer">
                    Get directions
                  </a>
                )}
              </div>
            )}
            {(settings.phone || settings.email) && (
              <div>
                <h3>Contact</h3>
                {settings.phone && <a href={phoneHref}>{settings.phone}</a>}
                {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
              </div>
            )}
            {settings.hours && (
              <div>
                <h3>Hours</h3>
                <p>{settings.hours}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} {settings.siteName}
        </span>
        <a href={instagramUrl} target="_blank" rel="noreferrer">
          Instagram
        </a>
      </footer>
    </>
  );
}
