import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/api";

// Attachments are private: this passes the admin's session on to the backend,
// which decides whether to hand the file over.
export async function GET(_request: Request, { params }: RouteContext<"/admin/inquiries/[id]/files/[name]">) {
  const { id, name } = await params;
  const token = (await cookies()).get("europa_admin")?.value;
  if (!token) return new Response("Sign in to continue.", { status: 401 });
  const response = await fetch(
    `${BACKEND_URL}/api/admin/inquiries/${encodeURIComponent(id)}/files/${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  ).catch(() => null);
  if (!response?.ok) return new Response("Not found", { status: response?.status ?? 404 });
  const headers = new Headers();
  for (const header of ["Content-Type", "Content-Disposition", "X-Content-Type-Options", "Content-Security-Policy"]) {
    const value = response.headers.get(header);
    if (value) headers.set(header, value);
  }
  return new Response(response.body, { headers });
}
