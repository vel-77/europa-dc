type Params = Promise<{ notice?: string; error?: string }>;

/** Shows the result of the last action, passed back in the URL by the server action. */
export async function Message({ searchParams }: { searchParams: Params }) {
  const { notice, error } = await searchParams;
  if (error) {
    return (
      <p className="admin-message is-error" role="alert">
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p className="admin-message" role="status">
        {notice}
      </p>
    );
  }
  return null;
}
