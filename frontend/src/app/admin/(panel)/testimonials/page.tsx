import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { getAdminSite } from "@/lib/api";
import { deleteTestimonial, moveTestimonial, saveTestimonial } from "../../actions";

export default async function TestimonialsPage({ searchParams }: PageProps<"/admin/testimonials">) {
  const { testimonials } = await getAdminSite();

  return (
    <>
      <h1>Testimonials</h1>
      <p className="admin-hint">Client quotes shown in the “Client experiences” rail. The starting quotes are sample content and should be replaced.</p>
      <Message searchParams={searchParams} />

      <section className="admin-card">
        <ul className="admin-list">
          {testimonials.map((testimonial, index) => (
            <li key={testimonial.id}>
              <details>
                <summary>
                  <span>“{testimonial.quote.length > 70 ? `${testimonial.quote.slice(0, 70)}…` : testimonial.quote}”</span>
                  <small>{testimonial.author}</small>
                </summary>
                <form action={saveTestimonial} className="admin-form">
                  <input type="hidden" name="id" value={testimonial.id} />
                  <label>
                    Quote
                    <textarea name="quote" rows={4} required maxLength={1000} defaultValue={testimonial.quote} />
                  </label>
                  <label>
                    Who said it, e.g. Homeowner, Architect
                    <input name="author" maxLength={120} defaultValue={testimonial.author} />
                  </label>
                  <button type="submit">Save testimonial</button>
                </form>
                <form action={deleteTestimonial}>
                  <input type="hidden" name="id" value={testimonial.id} />
                  <ConfirmButton label="Remove testimonial" confirmLabel="Remove this testimonial" />
                </form>
              </details>
              <MoveButtons action={moveTestimonial} id={testimonial.id} name="testimonial" first={index === 0} last={index === testimonials.length - 1} />
            </li>
          ))}
        </ul>
        {testimonials.length === 0 && <p>No testimonials yet. The section is hidden on the home page until one is added.</p>}
      </section>

      <section className="admin-card">
        <h2>Add a testimonial</h2>
        <form action={saveTestimonial} className="admin-form">
          <label>
            Quote
            <textarea name="quote" rows={4} required maxLength={1000} />
          </label>
          <label>
            Who said it, e.g. Homeowner, Architect
            <input name="author" maxLength={120} />
          </label>
          <button type="submit">Add testimonial</button>
        </form>
      </section>
    </>
  );
}
