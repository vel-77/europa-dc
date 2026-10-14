import { Message } from "@/components/admin/Message";
import { getAdminSite } from "@/lib/api";
import { saveSettings } from "../../actions";

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const { settings } = await getAdminSite();

  return (
    <>
      <h1>Settings</h1>
      <Message searchParams={searchParams} />
      <form action={saveSettings} className="admin-form">
        <section className="admin-card">
          <h2>Showroom and contact</h2>
          <label>
            Address
            <textarea name="address" rows={2} defaultValue={settings.address} />
          </label>
          <label>
            Map link
            <input name="mapUrl" inputMode="url" defaultValue={settings.mapUrl} />
          </label>
          <label>
            Phone
            <input name="phone" inputMode="tel" defaultValue={settings.phone} />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={settings.email} />
          </label>
          <label>
            Opening hours, one line per entry (leave empty to hide)
            <textarea name="hours" rows={3} placeholder={"Mon to Fri: 9 am to 6 pm\nSat: by appointment"} defaultValue={settings.hours} />
          </label>
          <label>
            Instagram username
            <input name="instagramHandle" defaultValue={settings.instagramHandle} />
          </label>
        </section>

        <button type="submit">Save settings</button>
      </form>
    </>
  );
}
