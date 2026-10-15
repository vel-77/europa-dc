import Link from "next/link";
import { getAdminSite } from "@/lib/api";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Redirects to the login page unless the backend accepts the session.
  const { inquiries } = await getAdminSite();
  const unread = inquiries.filter((inquiry) => !inquiry.read).length;
  return (
    <>
      <header className="admin-bar">
        <strong>Europa DC admin</strong>
        <nav aria-label="Admin sections">
          <Link href="/admin/inquiries">Inquiries{unread > 0 && <span className="admin-badge">{unread}</span>}</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/catalog">Catalog</Link>
          <Link href="/admin/solutions">Rooms</Link>
          <Link href="/admin/testimonials">Testimonials</Link>
          <Link href="/admin">Brands</Link>
          <Link href="/admin/services">Brand categories</Link>
          <Link href="/admin/instagram">Instagram</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
        <a href="/" target="_blank" rel="noreferrer">
          View site
        </a>
        <form action={logout}>
          <button type="submit" className="is-quiet">
            Sign out
          </button>
        </form>
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
