import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { getAdminSite } from "@/lib/api";
import { deleteBrand, moveBrand, saveBrand } from "../actions";

export default async function BrandsPage({ searchParams }: PageProps<"/admin">) {
  const { brands, categories } = await getAdminSite();

  const categoryOptions = categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.name}
    </option>
  ));

  return (
    <>
      <h1>Brands</h1>
      <Message searchParams={searchParams} />

      <section className="admin-card">
        <h2>Add a brand</h2>
        <form action={saveBrand} className="admin-form is-row">
          <label>
            Name
            <input name="name" required maxLength={80} />
          </label>
          <label>
            Service
            <select name="categoryId" required defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {categoryOptions}
            </select>
          </label>
          <label>
            Website (optional)
            <input name="url" inputMode="url" placeholder="https://" />
          </label>
          <label>
            Logo (optional)
            <input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
          </label>
          <button type="submit">Add brand</button>
        </form>
      </section>

      {categories.map((category) => {
        const list = brands.filter((brand) => brand.categoryId === category.id);
        if (list.length === 0) return null;
        return (
          <section key={category.id} className="admin-card">
            <h2>{category.name}</h2>
            <ul className="admin-list">
              {list.map((brand, index) => (
                <li key={brand.id}>
                  <details>
                    <summary>
                      {brand.logo && <img src={`/uploads/${brand.logo}`} alt="" />}
                      <span>{brand.name}</span>
                      {!brand.visible && <small>Hidden</small>}
                    </summary>
                    <form action={saveBrand} className="admin-form">
                      <input type="hidden" name="id" value={brand.id} />
                      <label>
                        Name
                        <input name="name" required maxLength={80} defaultValue={brand.name} />
                      </label>
                      <label>
                        Service
                        <select name="categoryId" defaultValue={brand.categoryId}>
                          {categoryOptions}
                        </select>
                      </label>
                      <label>
                        Website
                        <input name="url" inputMode="url" defaultValue={brand.url} />
                      </label>
                      <label>
                        {brand.logo ? "Replace logo" : "Logo"}
                        <input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
                      </label>
                      {brand.logo && (
                        <label className="is-check">
                          <input type="checkbox" name="removeLogo" /> Remove the logo and show the name as text
                        </label>
                      )}
                      <label className="is-check">
                        <input type="checkbox" name="visible" defaultChecked={brand.visible} /> Show on the site
                      </label>
                      <button type="submit">Save brand</button>
                    </form>
                    <form action={deleteBrand}>
                      <input type="hidden" name="id" value={brand.id} />
                      <input type="hidden" name="name" value={brand.name} />
                      <ConfirmButton label="Remove brand" confirmLabel={`Remove ${brand.name}`} />
                    </form>
                  </details>
                  <form action={moveBrand} className="admin-move">
                    <input type="hidden" name="id" value={brand.id} />
                    <button name="direction" value="up" className="is-quiet" disabled={index === 0} aria-label={`Move ${brand.name} up`}>
                      ↑
                    </button>
                    <button
                      name="direction"
                      value="down"
                      className="is-quiet"
                      disabled={index === list.length - 1}
                      aria-label={`Move ${brand.name} down`}
                    >
                      ↓
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {brands.length === 0 && <p>No brands yet. Add the first one above.</p>}
    </>
  );
}
