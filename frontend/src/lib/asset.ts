// On GitHub Pages the site lives under /<repo>, so every static asset URL
// needs that prefix. Next adds it to its own files but not to plain <img>
// tags or CSS, hence this helper. Elsewhere BASE_PATH is empty.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
