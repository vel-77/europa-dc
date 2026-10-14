import { BACKEND_URL } from "@/lib/api";

/** The public contact form posts here; the backend validates and stores the inquiry. */
export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const form = await request.formData();
  const body = new FormData();
  for (const key of ["name", "email", "projectType", "message"]) body.set(key, String(form.get(key) ?? ""));
  body.set("client", client);
  for (const file of form.getAll("files")) {
    if (file instanceof File && file.size > 0) body.append("files", file);
  }
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/inquiries`, { method: "POST", body, cache: "no-store" });
  } catch {
    return Response.json({ message: "We could not send your inquiry right now. Please try again in a moment." }, { status: 502 });
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = typeof data?.message === "string" ? data.message : "Something went wrong. Please try again.";
    return Response.json({ message }, { status: response.status });
  }
  return Response.json({ ok: true });
}
