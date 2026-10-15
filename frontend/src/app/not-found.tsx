import Link from "next/link";
import { Nav } from "@/components/site/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="shell pt-40 pb-section min-h-[70svh]">
        <p className="eyebrow text-taupe-ink">Page not found</p>
        <h1 className="serif ttl mt-6">This page doesn’t exist.</h1>
        <p className="mt-6 max-w-[30rem] text-lead text-ink/75">The link may be out of date, or the room may have been renamed.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/catalog" className="btn btn-dark">
            Browse the catalog <span className="arrow">→</span>
          </Link>
          <Link href="/" className="btn btn-line">
            Go to the home page
          </Link>
        </div>
      </main>
    </>
  );
}
