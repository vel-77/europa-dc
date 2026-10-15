import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { asset } from "./asset";
import demoCatalog from "./demo-catalog.json";
import demoSite from "./demo-site.json";
import type { AdminSite, CatalogItem, Site } from "./types";

// All data lives in the Java backend. These helpers run on the Next.js server
// only, so the backend never has to be reachable from the visitor's browser.
export const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8090").replace(/\/$/, "");

const SESSION_COOKIE = "europa_admin";

const DEMO = Boolean(process.env.DEMO_EXPORT);

/** Public address of an uploaded image. The static demo serves copies from /demo instead. */
export function uploadUrl(name: string | null | undefined) {
  if (!name) return null;
  return asset(`${DEMO ? "/demo" : "/uploads"}/${encodeURIComponent(name)}`);
}

/** An error from the backend whose message is meant to be shown to the admin. */
export class ApiError extends Error {}

async function request(path: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, { ...init, cache: "no-store" });
  } catch {
    throw new Error(`The backend at ${BACKEND_URL} is not reachable. Is it running?`);
  }
  return response;
}

async function errorMessage(response: Response) {
  const body = await response.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : `The backend returned status ${response.status}.`;
}

/**
 * Content for the public pages. Wrapped in React's cache so the metadata and
 * the page of one request share a single call to the backend.
 */
export const getSite = cache(async (): Promise<Site> => {
  // The static demo on GitHub Pages has no backend, so it ships a snapshot of the content.
  if (DEMO) return demoSite;
  // Render on every request, so admin changes and new Instagram posts show up at once.
  await connection();
  const response = await request("/api/site");
  if (!response.ok) throw new Error(await errorMessage(response));
  return response.json();
});

/** Every catalog item, in display order within its room. */
export const getCatalog = cache(async (): Promise<CatalogItem[]> => {
  if (DEMO) return demoCatalog.items;
  await connection();
  const response = await request("/api/catalog");
  if (!response.ok) throw new Error(await errorMessage(response));
  return ((await response.json()) as { items: CatalogItem[] }).items;
});

/* ---------- Admin session ---------- */

/** Exchanges the password for a session token and stores it in an httpOnly cookie. */
export async function signIn(password: string, client: string) {
  const response = await request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, client }),
  });
  if (!response.ok) throw new ApiError(await errorMessage(response));
  const { token, maxAgeSeconds } = (await response.json()) as { token: string; maxAgeSeconds: number };
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** True only if the backend still accepts the stored token (it may have expired). */
export async function isSignedIn() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const response = await request("/api/admin/site", { headers: { Authorization: `Bearer ${token}` } });
  return response.ok;
}

/**
 * Calls an /api/admin endpoint with the session token. The backend decides
 * whether the token is valid; if it is not, the visitor is sent to the login page.
 */
export async function adminRequest(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  const response = await request(`/api/admin${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) redirect("/admin/login");
  if (!response.ok) throw new ApiError(await errorMessage(response));
  return response;
}

/** Everything the admin panel shows. Also acts as the access check for admin pages. */
export async function getAdminSite(): Promise<AdminSite> {
  return (await adminRequest("/site")).json();
}
