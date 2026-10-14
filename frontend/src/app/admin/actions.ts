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

/* ---------- Solutions ---------- */

export async function saveSolution(form: FormData) {
  const id = text(form, "id");
  const title = text(form, "title");
  const body = new FormData();
  body.set("title", title);
  body.set("description", text(form, "description"));
  body.set("removeImage", String(form.get("removeImage") === "on"));
  const image = form.get("image");
  if (image instanceof File && image.size > 0) body.set("image", image);
  await send("/admin/solutions", id ? `/solutions/${encodeURIComponent(id)}` : "/solutions", { method: "POST", body });
  back("/admin/solutions", id ? `Saved ${title}.` : `Added ${title}.`);
}

export async function deleteSolution(form: FormData) {
  await send("/admin/solutions", `/solutions/${encodeURIComponent(text(form, "id"))}`, { method: "DELETE" });
  back("/admin/solutions", `Removed ${text(form, "name")}.`);
}

export async function moveSolution(form: FormData) {
  const path = `/solutions/${encodeURIComponent(text(form, "id"))}/move`;
  await send("/admin/solutions", path, json("POST", { direction: text(form, "direction") }));
  redirect("/admin/solutions");
}

/* ---------- Projects ---------- */

export async function saveProject(form: FormData) {
  const id = text(form, "id");
  const title = text(form, "title");
  const body = new FormData();
  body.set("title", title);
  body.set("tags", text(form, "tags"));
  body.set("location", text(form, "location"));
  body.set("removeCover", String(form.get("removeCover") === "on"));
  const cover = form.get("cover");
  if (cover instanceof File && cover.size > 0) body.set("cover", cover);
  for (const photo of form.getAll("photos")) {
    if (photo instanceof File && photo.size > 0) body.append("photos", photo);
  }
  for (const name of form.getAll("removePhotos")) body.append("removePhotos", String(name));
  await send("/admin/projects", id ? `/projects/${encodeURIComponent(id)}` : "/projects", { method: "POST", body });
  back("/admin/projects", id ? `Saved ${title}.` : `Added ${title}.`);
}

export async function deleteProject(form: FormData) {
  await send("/admin/projects", `/projects/${encodeURIComponent(text(form, "id"))}`, { method: "DELETE" });
  back("/admin/projects", `Removed ${text(form, "name")}.`);
}

export async function moveProject(form: FormData) {
  const path = `/projects/${encodeURIComponent(text(form, "id"))}/move`;
  await send("/admin/projects", path, json("POST", { direction: text(form, "direction") }));
  redirect("/admin/projects");
}

/* ---------- Testimonials ---------- */

export async function saveTestimonial(form: FormData) {
  const id = text(form, "id");
  const body = { quote: text(form, "quote"), author: text(form, "author") };
  if (id) {
    await send("/admin/testimonials", `/testimonials/${encodeURIComponent(id)}`, json("PUT", body));
  } else {
    await send("/admin/testimonials", "/testimonials", json("POST", body));
  }
  back("/admin/testimonials", id ? "Saved the testimonial." : "Added the testimonial.");
}

export async function deleteTestimonial(form: FormData) {
  await send("/admin/testimonials", `/testimonials/${encodeURIComponent(text(form, "id"))}`, { method: "DELETE" });
  back("/admin/testimonials", "Removed the testimonial.");
}

export async function moveTestimonial(form: FormData) {
  const path = `/testimonials/${encodeURIComponent(text(form, "id"))}/move`;
  await send("/admin/testimonials", path, json("POST", { direction: text(form, "direction") }));
  redirect("/admin/testimonials");
}

/* ---------- Inquiries ---------- */

export async function markInquiry(form: FormData) {
  const read = text(form, "read") === "true";
  await send("/admin/inquiries", `/inquiries/${encodeURIComponent(text(form, "id"))}/read`, json("POST", { read }));
  redirect("/admin/inquiries");
}

export async function deleteInquiry(form: FormData) {
  await send("/admin/inquiries", `/inquiries/${encodeURIComponent(text(form, "id"))}`, { method: "DELETE" });
  back("/admin/inquiries", "Deleted the inquiry.");
}

/* ---------- Settings ---------- */

const SETTINGS_FIELDS = [
  "siteName",
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
