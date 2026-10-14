import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { getAdminSite } from "@/lib/api";
import { deleteInquiry, markInquiry } from "../../actions";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function InquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  const { inquiries } = await getAdminSite();

  return (
    <>
      <h1>Inquiries</h1>
      <p className="admin-hint">Messages sent through the contact form on the home page, newest first. Nothing is emailed; check here.</p>
      <Message searchParams={searchParams} />

      {inquiries.length === 0 && (
        <section className="admin-card">
          <p>No inquiries yet.</p>
        </section>
      )}

      {inquiries.map((inquiry) => (
        <section key={inquiry.id} className={`admin-card admin-inquiry ${inquiry.read ? "" : "is-unread"}`}>
          <header>
            <h2>
              {inquiry.name} <small>{inquiry.projectType}</small>
            </h2>
            <time dateTime={inquiry.createdAt}>{when(inquiry.createdAt)}</time>
          </header>
          <p>
            <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
          </p>
          <p className="admin-inquiry-message">{inquiry.message}</p>
          {inquiry.files.length > 0 && (
            <ul className="admin-inquiry-files">
              {inquiry.files.map((file) => (
                <li key={file.stored}>
                  <a href={`/admin/inquiries/${inquiry.id}/files/${encodeURIComponent(file.stored)}`} target="_blank" rel="noreferrer">
                    {file.originalName}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="admin-actions">
            <form action={markInquiry}>
              <input type="hidden" name="id" value={inquiry.id} />
              <input type="hidden" name="read" value={String(!inquiry.read)} />
              <button type="submit" className="is-quiet">
                {inquiry.read ? "Mark as unread" : "Mark as read"}
              </button>
            </form>
            <form action={deleteInquiry}>
              <input type="hidden" name="id" value={inquiry.id} />
              <ConfirmButton label="Delete" confirmLabel="Delete this inquiry" />
            </form>
          </div>
        </section>
      ))}
    </>
  );
}
