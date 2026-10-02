import Link from "next/link";
import { getAdminSite } from "@/lib/api";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Redirects to the login page unless the backend accepts the session.
  await getAdminSite();
  return (
    <>
      <header className="admin-bar">
        <strong>Europa DC admin</strong>
        <nav aria-label="Admin sections">
          <Link href="/admin">Brands</Link>
          <Link href="/admin/services">Services</Link>
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
