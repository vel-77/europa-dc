"use client";

import { useState } from "react";

/** A submit button that asks once before it submits, without a browser dialog. */
export function ConfirmButton({ label, confirmLabel }: { label: string; confirmLabel: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="is-quiet is-danger" onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="admin-confirm">
      <button type="submit" className="is-danger">
        {confirmLabel}
      </button>
      <button type="button" className="is-quiet" onClick={() => setAsking(false)}>
        Keep
      </button>
    </span>
  );
}
