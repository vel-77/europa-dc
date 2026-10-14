/** Up and down arrows that submit a "move" action for one list entry. */
export function MoveButtons({
  action,
  id,
  name,
  first,
  last,
}: {
  action: (form: FormData) => Promise<void>;
  id: string;
  name: string;
  first: boolean;
  last: boolean;
}) {
  return (
    <form action={action} className="admin-move">
      <input type="hidden" name="id" value={id} />
      <button name="direction" value="up" className="is-quiet" disabled={first} aria-label={`Move ${name} up`}>
        ↑
      </button>
      <button name="direction" value="down" className="is-quiet" disabled={last} aria-label={`Move ${name} down`}>
        ↓
      </button>
    </form>
  );
}
