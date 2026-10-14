// Captures the backend's public content into src/lib/demo-site.json and copies
// the referenced images to public/demo, for the static GitHub Pages demo.
// Usage: node scripts-snapshot.mjs [backend url]
import { mkdir, rm, writeFile } from "node:fs/promises";

const backend = (process.argv[2] ?? process.env.BACKEND_URL ?? "http://localhost:8090").replace(/\/$/, "");
const site = await (await fetch(`${backend}/api/site`)).json();
await rm("public/demo", { recursive: true, force: true });
await mkdir("public/demo", { recursive: true });

const names = new Set();
for (const s of site.solutions) if (s.image) names.add(s.image);
for (const p of site.projects) {
  if (p.cover) names.add(p.cover);
  p.gallery.forEach((n) => names.add(n));
}
for (const b of site.brands) if (b.logo) names.add(b.logo);
for (const name of names) {
  const response = await fetch(`${backend}/uploads/${encodeURIComponent(name)}`);
  await writeFile(`public/demo/${name}`, Buffer.from(await response.arrayBuffer()));
}
// Instagram image links expire, so the demo never shows posts.
site.posts = [];
await writeFile("src/lib/demo-site.json", JSON.stringify(site, null, 2));
console.log(`Saved ${names.size} images and src/lib/demo-site.json`);
