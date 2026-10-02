import { BACKEND_URL } from "@/lib/api";

// Uploaded logos are stored by the backend; this passes them through so the
// browser only ever talks to the website's own address.
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[name]">) {
  const { name } = await params;
  const response = await fetch(`${BACKEND_URL}/uploads/${encodeURIComponent(name)}`, { cache: "no-store" }).catch(
    () => null,
  );
  if (!response?.ok) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  for (const header of ["Content-Type", "Cache-Control", "X-Content-Type-Options", "Content-Security-Policy"]) {
    const value = response.headers.get(header);
    if (value) headers.set(header, value);
  }
  return new Response(response.body, { headers });
}
