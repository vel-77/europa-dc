import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { getAdminSite, uploadUrl } from "@/lib/api";
import { deleteSolution, moveSolution, saveSolution } from "../../actions";

export default async function SolutionsPage({ searchParams }: PageProps<"/admin/solutions">) {
  const { solutions } = await getAdminSite();

  return (
    <>
      <h1>Rooms</h1>
      <p className="admin-hint">
        The rooms listed under Solutions on the home page. Each has its own catalog page; add designs to it under Catalog. Keep the
        photo upright (4:5 works best).
      </p>
      <Message searchParams={searchParams} />

      <section className="admin-card">
        <ul className="admin-list">
          {solutions.map((solution, index) => (
            <li key={solution.id}>
              <details>
                <summary>
                  {solution.image && <img src={uploadUrl(solution.image) ?? ""} alt="" />}
                  <span>{solution.title}</span>
                  <small>/catalog/{solution.slug}</small>
                </summary>
                <form action={saveSolution} className="admin-form">
                  <input type="hidden" name="id" value={solution.id} />
                  <label>
                    Title
                    <input name="title" required maxLength={80} defaultValue={solution.title} />
                  </label>
                  <label>
                    Short description
                    <input name="description" maxLength={200} defaultValue={solution.description} />
                  </label>
                  <label>
                    Address of its catalog page: /catalog/…
                    <input name="slug" maxLength={80} pattern="[A-Za-z0-9 -]*" defaultValue={solution.slug} />
                  </label>
                  <label>
                    Introduction on its catalog page
                    <textarea name="intro" rows={3} maxLength={1000} defaultValue={solution.intro} />
                  </label>
                  <label>
                    {solution.image ? "Replace photo" : "Photo"}
                    <input type="file" name="image" accept="image/png,image/jpeg,image/webp" />
                  </label>
                  {solution.image && (
                    <label className="is-check">
                      <input type="checkbox" name="removeImage" /> Remove the photo
                    </label>
                  )}
                  <button type="submit">Save room</button>
                </form>
                <form action={deleteSolution}>
                  <input type="hidden" name="id" value={solution.id} />
                  <input type="hidden" name="name" value={solution.title} />
                  <ConfirmButton label="Remove room" confirmLabel={`Remove ${solution.title}`} />
                </form>
              </details>
              <MoveButtons action={moveSolution} id={solution.id} name={solution.title} first={index === 0} last={index === solutions.length - 1} />
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card">
        <h2>Add a room</h2>
        <form action={saveSolution} className="admin-form">
          <label>
            Title
            <input name="title" required maxLength={80} />
          </label>
          <label>
            Short description
            <input name="description" maxLength={200} />
          </label>
          <label>
            Introduction on its catalog page
            <textarea name="intro" rows={3} maxLength={1000} />
          </label>
          <label>
            Photo
            <input type="file" name="image" accept="image/png,image/jpeg,image/webp" />
          </label>
          <button type="submit">Add room</button>
        </form>
      </section>
    </>
  );
}
