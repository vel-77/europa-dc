import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { getAdminSite, uploadUrl } from "@/lib/api";
import { deleteProject, moveProject, saveProject } from "../../actions";

const IMAGE_TYPES = "image/png,image/jpeg,image/webp";

export default async function ProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const { projects } = await getAdminSite();

  return (
    <>
      <h1>Projects</h1>
      <p className="admin-hint">
        Featured projects shown in the carousel on the home page. The cover is the large photo; gallery photos open when a
        visitor clicks “View project”. The starting projects are sample content from the design and should be replaced.
      </p>
      <Message searchParams={searchParams} />

      <section className="admin-card">
        <ul className="admin-list">
          {projects.map((project, index) => (
            <li key={project.id}>
              <details>
                <summary>
                  {project.cover && <img src={uploadUrl(project.cover) ?? ""} alt="" />}
                  <span>{project.title}</span>
                  <small>
                    {project.gallery.length} photo{project.gallery.length === 1 ? "" : "s"}
                  </small>
                </summary>
                <form action={saveProject} className="admin-form">
                  <input type="hidden" name="id" value={project.id} />
                  <label>
                    Title
                    <input name="title" required maxLength={120} defaultValue={project.title} />
                  </label>
                  <label>
                    Materials line, e.g. Kitchen / Dekton / Walnut
                    <input name="tags" maxLength={200} defaultValue={project.tags} />
                  </label>
                  <label>
                    Location
                    <input name="location" maxLength={120} defaultValue={project.location} />
                  </label>
                  <label>
                    {project.cover ? "Replace cover photo" : "Cover photo"}
                    <input type="file" name="cover" accept={IMAGE_TYPES} />
                  </label>
                  {project.cover && (
                    <label className="is-check">
                      <input type="checkbox" name="removeCover" /> Remove the cover photo
                    </label>
                  )}
                  {project.gallery.length > 0 && (
                    <fieldset className="admin-gallery">
                      <legend>Gallery photos. Tick a photo to remove it.</legend>
                      {project.gallery.map((name) => (
                        <label key={name}>
                          <img src={uploadUrl(name) ?? ""} alt="" />
                          <span>
                            <input type="checkbox" name="removePhotos" value={name} /> Remove
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  )}
                  <label>
                    Add gallery photos (up to 12 in total)
                    <input type="file" name="photos" accept={IMAGE_TYPES} multiple />
                  </label>
                  <button type="submit">Save project</button>
                </form>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="name" value={project.title} />
                  <ConfirmButton label="Remove project" confirmLabel={`Remove ${project.title}`} />
                </form>
              </details>
              <MoveButtons action={moveProject} id={project.id} name={project.title} first={index === 0} last={index === projects.length - 1} />
            </li>
          ))}
        </ul>
        {projects.length === 0 && <p>No projects yet. Add the first one below.</p>}
      </section>

      <section className="admin-card">
        <h2>Add a project</h2>
        <form action={saveProject} className="admin-form">
          <label>
            Title
            <input name="title" required maxLength={120} />
          </label>
          <label>
            Materials line, e.g. Kitchen / Dekton / Walnut
            <input name="tags" maxLength={200} />
          </label>
          <label>
            Location
            <input name="location" maxLength={120} />
          </label>
          <label>
            Cover photo
            <input type="file" name="cover" accept={IMAGE_TYPES} />
          </label>
          <label>
            Gallery photos
            <input type="file" name="photos" accept={IMAGE_TYPES} multiple />
          </label>
          <button type="submit">Add project</button>
        </form>
      </section>
    </>
  );
}
