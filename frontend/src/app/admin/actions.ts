"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminRequest, ApiError, signIn, signOut } from "@/lib/api";

// Each action forwards the submitted form to the Java backend, which does the
// validation and storage, then sends the admin back to the page with the result.

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function back(page: string, message: string, kind: "notice" | "error" = "notice"): never {
  redirect(`${page}?${kind}=${encodeURIComponent(message)}`);
}

/** Calls the backend; a rejected request becomes an error message on `page`. */
async function send(page: string, path: string, init: RequestInit) {
  try {
    await adminRequest(path, init);
  } catch (error) {
    if (error instanceof ApiError) back(page, error.message, "error");
    throw error;
  }
}

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

/* ---------- Session ---------- */

export async function login(_previous: string | null, form: FormData): Promise<string | null> {
  // The backend limits failed attempts per client, so tell it who is asking.
  const client = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  try {
    await signIn(String(form.get("password") ?? ""), client);
  } catch (error) {
    if (error instanceof ApiError) return error.message;
    throw error;
  }
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin/login");
}

/* ---------- Brands ---------- */

export async function saveBrand(form: FormData) {
  const id = text(form, "id");
  const name = text(form, "name");
  const body = new FormData();
  body.set("name", name);
  body.set("categoryId", text(form, "categoryId"));
  body.set("url", text(form, "url"));
  body.set("visible", String(form.get("visible") === "on"));
  body.set("removeLogo", String(form.get("removeLogo") === "on"));
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) body.set("logo", logo);

  await send("/admin", id ? `/brands/${encodeURIComponent(id)}` : "/brands", { method: "POST", body });
  back("/admin", id ? `Saved ${name}.` : `Added ${name}.`);
}

export async function deleteBrand(form: FormData) {
  await send("/admin", `/brands/${encodeURIComponent(text(form, "id"))}`, { method: "DELETE" });
  back("/admin", `Removed ${text(form, "name")}.`);
}

export async function moveBrand(form: FormData) {
  const path = `/brands/${encodeURIComponent(text(form, "id"))}/move`;
  await send("/admin", path, json("POST", { direction: text(form, "direction") }));
  redirect("/admin");
}

/* ---------- Services (categories) ---------- */

export async function saveCategory(form: FormData) {
  const id = text(form, "id");
  const name = text(form, "name");
  const body = { name, blurb: text(form, "blurb"), items: text(form, "items").split("\n") };
  if (id) {
    await send("/admin/services", `/categories/${encodeURIComponent(id)}`, json("PUT", body));
  } else {
    await send("/admin/services", "/categories", json("POST", body));
  }
  back("/admin/services", id ? `Saved ${name}.` : `Added ${name}.`);
}

export async function deleteCategory(form: FormData) {
  await send("/admin/services", `/categories/${encodeURIComponent(text(form, "id"))}`, { method: "DELETE" });
  back("/admin/services", "Removed the service.");
}

export async function moveCategory(form: FormData) {
  const path = `/categories/${encodeURIComponent(text(form, "id"))}/move`;
  await send("/admin/services", path, json("POST", { direction: text(form, "direction") }));
  redirect("/admin/services");
}

/* ---------- Settings ---------- */

const SETTINGS_FIELDS = [
  "siteName",
  "heroTitle",
  "heroText",
  "address",
  "mapUrl",
  "phone",
  "email",
  "hours",
  "instagramHandle",
] as const;

export async function saveSettings(form: FormData) {
  const body = Object.fromEntries(SETTINGS_FIELDS.map((field) => [field, text(form, field)]));
  await send("/admin/settings", "/settings", json("PUT", body));
  back("/admin/settings", "Saved settings.");
}

/* ---------- Instagram ---------- */

export async function saveInstagram(form: FormData) {
  // An empty token field keeps the token that is already saved.
  const body = { accessToken: text(form, "accessToken"), postCount: Number(text(form, "postCount")) || 8 };
  await send("/admin/instagram", "/instagram", json("PUT", body));
  back("/admin/instagram", "Saved. The result of the connection test is shown below.");
}

export async function refreshInstagram() {
  await send("/admin/instagram", "/instagram/refresh", { method: "POST" });
  back("/admin/instagram", "Checked Instagram for new posts.");
}

export async function disconnectInstagram() {
  await send("/admin/instagram", "/instagram", { method: "DELETE" });
  back("/admin/instagram", "Disconnected Instagram.");
}
