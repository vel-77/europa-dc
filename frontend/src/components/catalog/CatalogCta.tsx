import Link from "next/link";
import { Split } from "@/components/site/Split";

/** Closing band on the catalog pages: everything is made to measure, so invite a visit. */
export function CatalogCta() {
  return (
    <section className="py-section bg-charcoal text-ivory">
      <div className="shell">
        <div className="grid-12 gap-y-8 items-end">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow text-stone reveal">Made to measure</p>
            <h2 className="serif ttl mt-5 lg:mt-6">
              <Split lines={["See it in person."]} />
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 reveal">
            <p className="text-lead text-stone">
              Every design is adapted to your space. Visit the Glendale showroom to see materials and finishes at full scale, or
              tell us about your project.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#contact" className="btn btn-light">
                Book a Consultation <span className="arrow">→</span>
              </Link>
              <Link href="/#showroom" className="btn btn-ghost-light">
                Visit the Showroom
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
