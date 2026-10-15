import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { getAdminSite, uploadUrl } from "@/lib/api";
import { deleteCatalogItem, moveCatalogItem, saveCatalogItem } from "../../actions";

const IMAGE_TYPES = "image/png,image/jpeg,image/webp";

export default async function CatalogAdminPage({ searchParams }: PageProps<"/admin/catalog">) {
  const { solutions: rooms, catalog } = await getAdminSite();
  const { room: roomParam } = await searchParams;
  const room = rooms.find((entry) => entry.id === roomParam) ?? rooms[0];

  if (!room) {
    return (
      <>
        <h1>Catalog</h1>
        <p className="admin-hint">
          Add a room under <Link href="/admin/solutions">Rooms</Link> first; each room has its own catalog page.
        </p>
      </>
    );
  }

  const items = catalog.filter((item) => item.roomId === room.id);
  const roomOptions = rooms.map((entry) => (
    <option key={entry.id} value={entry.id}>
      {entry.title}
    </option>
  ));

  return (
    <>
      <h1>Catalog</h1>
      <p className="admin-hint">
        The designs on each room’s catalog page. The cover is the photo in the grid; more photos open in the gallery. Photos
        can be up to 8 MB each. The starting items are samples made from the designer’s photos and should be replaced.
      </p>

      <nav className="admin-tabs" aria-label="Rooms">
        {rooms.map((entry) => {
          const count = catalog.filter((item) => item.roomId === entry.id).length;
          return (
            <Link key={entry.id} href={`/admin/catalog?room=${entry.id}`} aria-current={entry.id === room.id ? "page" : undefined}>
              {entry.title} <small>{count}</small>
            </Link>
          );
        })}
      </nav>

      <Message searchParams={searchParams} />

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{room.title}</h2>
          <a href={`/catalog/${room.slug}`} target="_blank" rel="noreferrer">
            View on the site
          </a>
        </div>
        <ul className="admin-list">
          {items.map((item, index) => (
            <li key={item.id}>
              <details>
                <summary>
                  {item.cover && <img src={uploadUrl(item.cover) ?? ""} alt="" />}
                  <span>{item.title}</span>
                  <small>
                    {item.gallery.length + (item.cover ? 1 : 0)} photo{item.gallery.length + (item.cover ? 1 : 0) === 1 ? "" : "s"}
                  </small>
                </summary>
                <form action={saveCatalogItem} className="admin-form">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="returnRoom" value={room.id} />
                  <label>
                    Name
                    <input name="title" required maxLength={120} defaultValue={item.title} />
                  </label>
                  <label>
                    Room
                    <select name="roomId" defaultValue={item.roomId}>
                      {roomOptions}
                    </select>
                  </label>
                  <label>
                    Materials line, e.g. Walnut veneer / Stone / Brass
                    <input name="details" maxLength={200} defaultValue={item.details} />
                  </label>
                  <label>
                    Description
                    <textarea name="description" rows={3} maxLength={2000} defaultValue={item.description} />
                  </label>
                  <label>
                    {item.cover ? "Replace cover photo" : "Cover photo"}
                    <input type="file" name="cover" accept={IMAGE_TYPES} />
                  </label>
                  {item.cover && (
                    <label className="is-check">
                      <input type="checkbox" name="removeCover" /> Remove the cover photo
                    </label>
                  )}
                  {item.gallery.length > 0 && (
                    <fieldset className="admin-gallery">
                      <legend>More photos. Tick a photo to remove it.</legend>
                      {item.gallery.map((name) => (
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
                    Add more photos (up to 12 besides the cover)
                    <input type="file" name="photos" accept={IMAGE_TYPES} multiple />
                  </label>
                  <button type="submit">Save item</button>
                </form>
                <form action={deleteCatalogItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="name" value={item.title} />
                  <ConfirmButton label="Remove item" confirmLabel={`Remove ${item.title}`} />
                </form>
              </details>
              <MoveButtons
                action={moveCatalogItem}
                id={item.id}
                name={item.title}
                first={index === 0}
                last={index === items.length - 1}
                extra={{ roomId: room.id }}
              />
            </li>
          ))}
        </ul>
        {items.length === 0 && <p>No designs in this room yet. Add the first one below.</p>}
      </section>

      <section className="admin-card">
        <h2>Add a design to {room.title}</h2>
        <form action={saveCatalogItem} className="admin-form">
          <input type="hidden" name="roomId" value={room.id} />
          <label>
            Name
            <input name="title" required maxLength={120} />
          </label>
          <label>
            Materials line, e.g. Walnut veneer / Stone / Brass
            <input name="details" maxLength={200} />
          </label>
          <label>
            Description
            <textarea name="description" rows={3} maxLength={2000} />
          </label>
          <label>
            Cover photo
            <input type="file" name="cover" accept={IMAGE_TYPES} />
          </label>
          <label>
            More photos (up to 12 besides the cover)
            <input type="file" name="photos" accept={IMAGE_TYPES} multiple />
          </label>
          <button type="submit">Add design</button>
        </form>
      </section>
    </>
  );
}
