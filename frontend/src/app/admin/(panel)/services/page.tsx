import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { getAdminSite } from "@/lib/api";
import { deleteCategory, moveCategory, saveCategory } from "../../actions";

export default async function ServicesPage({ searchParams }: PageProps<"/admin/services">) {
  const { categories, brands } = await getAdminSite();

  return (
    <>
      <h1>Services</h1>
      <p className="admin-hint">
        The list of what Europa DC offers. Brands are grouped under these on the home page.
      </p>
      <Message searchParams={searchParams} />

      <section className="admin-card">
        <ul className="admin-list">
          {categories.map((category, index) => {
            const brandCount = brands.filter((brand) => brand.categoryId === category.id).length;
            return (
              <li key={category.id}>
                <details>
                  <summary>
                    <span>{category.name}</span>
                    <small>
                      {brandCount} brand{brandCount === 1 ? "" : "s"}
                    </small>
                  </summary>
                  <form action={saveCategory} className="admin-form">
                    <input type="hidden" name="id" value={category.id} />
                    <label>
                      Name
                      <input name="name" required maxLength={80} defaultValue={category.name} />
                    </label>
                    <label>
                      Short description
                      <input name="blurb" maxLength={200} defaultValue={category.blurb} />
                    </label>
                    <label>
                      What it includes, one per line
                      <textarea name="items" rows={4} defaultValue={category.items.join("\n")} />
                    </label>
                    <button type="submit">Save service</button>
                  </form>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <ConfirmButton label="Remove service" confirmLabel={`Remove ${category.name}`} />
                  </form>
                </details>
                <form action={moveCategory} className="admin-move">
                  <input type="hidden" name="id" value={category.id} />
                  <button name="direction" value="up" className="is-quiet" disabled={index === 0} aria-label={`Move ${category.name} up`}>
                    ↑
                  </button>
                  <button
                    name="direction"
                    value="down"
                    className="is-quiet"
                    disabled={index === categories.length - 1}
                    aria-label={`Move ${category.name} down`}
                  >
                    ↓
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="admin-card">
        <h2>Add a service</h2>
        <form action={saveCategory} className="admin-form">
          <label>
            Name
            <input name="name" required maxLength={80} />
          </label>
          <label>
            Short description
            <input name="blurb" maxLength={200} />
          </label>
          <label>
            What it includes, one per line
            <textarea name="items" rows={3} />
          </label>
          <button type="submit">Add service</button>
        </form>
      </section>
    </>
  );
}
