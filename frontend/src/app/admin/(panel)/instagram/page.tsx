import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Message } from "@/components/admin/Message";
import { getAdminSite } from "@/lib/api";
import { disconnectInstagram, refreshInstagram, saveInstagram } from "../../actions";

function when(iso: string | null) {
  if (!iso) return "never";
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default async function InstagramPage({ searchParams }: PageProps<"/admin/instagram">) {
  const { instagram, settings, posts } = await getAdminSite();
  const { connected } = instagram;

  return (
    <>
      <h1>Instagram</h1>
      <p className="admin-hint">
        The home page shows the latest posts from @{settings.instagramHandle} and checks for new ones every
        15 minutes. Nothing needs to be done after a new post is published.
      </p>
      <Message searchParams={searchParams} />

      <section className="admin-card">
        <h2>Status</h2>
        {!connected && <p>Not connected. The home page shows a link to the profile instead of posts.</p>}
        {connected && instagram.lastError && (
          <p className="admin-message is-error" role="alert">
            Instagram rejected the last request: {instagram.lastError}
            <br />
            If the token expired or was revoked, create a new one and paste it below.
          </p>
        )}
        {connected && !instagram.lastError && (
          <p>
            Connected. Showing {posts.length} post{posts.length === 1 ? "" : "s"}, last checked{" "}
            {when(instagram.fetchedAt)}. Token last renewed {when(instagram.tokenUpdatedAt)}.
          </p>
        )}
        {connected && (
          <div className="admin-actions">
            <form action={refreshInstagram}>
              <button type="submit" className="is-quiet">
                Check for new posts now
              </button>
            </form>
            <form action={disconnectInstagram}>
              <ConfirmButton label="Disconnect" confirmLabel="Disconnect Instagram" />
            </form>
          </div>
        )}
        {posts.length > 0 && (
          <ul className="admin-thumbs">
            {posts.map((post) => (
              <li key={post.id}>
                <img src={post.image} alt="" loading="lazy" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <h2>{connected ? "Connection" : "Connect the account"}</h2>
        <form action={saveInstagram} className="admin-form">
          <label>
            Access token
            <input
              name="accessToken"
              type="password"
              autoComplete="off"
              placeholder={connected ? "Saved. Leave empty to keep the current token." : ""}
              required={!connected}
            />
          </label>
          <label>
            Number of posts to show
            <input name="postCount" type="number" min={3} max={24} defaultValue={instagram.postCount} />
          </label>
          <button type="submit">{connected ? "Save" : "Connect Instagram"}</button>
        </form>
        <details className="admin-help">
          <summary>How to get an access token</summary>
          <ol>
            <li>
              The Instagram account must be a professional (business or creator) account. @europa.dc can switch
              in the Instagram app under Settings, Account type and tools.
            </li>
            <li>
              Sign in at developers.facebook.com, create an app, and add the product “Instagram” with “API setup
              with Instagram login”.
            </li>
            <li>
              Under “Generate access tokens”, add the Instagram account and sign in with it. Copy the token that
              is generated.
            </li>
            <li>Paste the token above. It is renewed automatically from then on.</li>
          </ol>
        </details>
      </section>
    </>
  );
}
