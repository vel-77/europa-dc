# Europa DC website

Website and admin panel for Europa Design Center (Glendale, CA).

- `backend/` is a Java (Spring Boot) service. It owns all data: solutions, projects,
  testimonials, brands, settings, uploaded images, contact-form inquiries, admin login and
  the Instagram feed.
- `frontend/` is a Next.js app. It renders the public home page and the admin panel, and
  gets everything from the backend's JSON API.
- `design/` (not in git) is the design hand-off the site is built from; the page is
  `design/Europa DC/Europa Landing - Hero Section 4.html`.

## Run it

Backend (needs Java 21 or newer):

```bash
cd backend
cp .env.example .env         # then set ADMIN_PASSWORD and SESSION_SECRET
./mvnw spring-boot:run       # http://localhost:8090
```

Frontend (needs Node 20 or newer):

```bash
cd frontend
cp .env.example .env.local   # BACKEND_URL, defaults to http://localhost:8090
npm install
npm run dev                  # http://localhost:3000, admin at /admin
```

For production: `./mvnw package` and run the jar in `backend/target/`; `npm run build` and
`npm start` in `frontend/`. Only the frontend has to be reachable from the internet. The
backend listens on localhost unless `SERVER_ADDRESS` is set.

## Where things are

| What | Where |
| --- | --- |
| Home page | `frontend/src/app/page.tsx` (static sections), `frontend/src/components/site/` (sections with behaviour), styles and design tokens in `frontend/src/app/globals.css` |
| Hero video scrub | `frontend/src/components/site/Hero.tsx`; 170 frames per size in `frontend/public/hero/1920` and `/1280`, cut from the design's video with `ffmpeg -i video.mp4 -vf "fps=12,scale=1920:-2" -c:v libwebp -quality 82 f%03d.webp` (and `scale=1280:-2`). If the frame count changes, update `FRAME_COUNT` |
| Catalog pages | `frontend/src/app/catalog/` (`/catalog` and `/catalog/<room>`), components in `frontend/src/components/catalog/` |
| Contact form | `frontend/src/components/site/ContactForm.tsx` → `frontend/src/app/api/inquiry/route.ts` → backend. Accepts `?type=Kitchen&about=<design>` to pre-fill |
| Admin panel pages | `frontend/src/app/admin/`; every change goes through `actions.ts` to the backend |
| Backend API client | `frontend/src/lib/api.ts` |
| API endpoints | `backend/.../site/PublicController.java`, `AdminController.java`, `inquiry/InquiryController.java`, `auth/LoginController.java` |
| Rooms (Solutions), projects, testimonials | `backend/.../site/ContentService.java` |
| Catalog items | `backend/.../site/CatalogService.java` |
| Brands, categories, settings | `backend/.../site/SiteService.java` |
| Inquiries | `backend/.../inquiry/InquiryService.java` |
| Instagram feed | `backend/.../instagram/InstagramService.java` |
| First-run content and upgrades | `backend/.../site/SiteSeeder.java` (projects, testimonials and catalog items are sample content; `CONTENT_VERSION` upgrades older databases on start-up) |
| Static demo snapshot | `frontend/scripts-snapshot.mjs` writes `src/lib/demo-site.json`, `src/lib/demo-catalog.json` and `public/demo/` from a running backend |

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/site` | Everything the home page shows, including the rooms |
| `GET /api/catalog` | Every catalog item, with the id of its room |
| `GET /uploads/{name}` | An uploaded brand logo |
| `POST /api/inquiries` | Contact form (multipart, up to five `files`) |
| `POST /api/admin/login` | Password in, session token out |
| `GET /api/admin/site` | Everything the admin panel shows |
| `POST /api/admin/brands`, `POST /api/admin/brands/{id}` | Add or update a brand (multipart form, optional `logo` file) |
| `DELETE /api/admin/brands/{id}`, `POST /api/admin/brands/{id}/move` | Remove or reorder a brand |
| `POST`, `PUT`, `DELETE /api/admin/categories[/{id}]`, `POST .../move` | Manage brand categories |
| `POST /api/admin/solutions[/{id}]`, `DELETE`, `POST .../move` | Manage rooms (multipart: `title`, `description`, `slug`, `intro`, optional `image`) |
| `POST /api/admin/catalog[/{id}]`, `DELETE`, `POST .../move` | Manage catalog items (multipart: `roomId`, `title`, `details`, `description`, `cover`, `photos`, `removePhotos`) |
| `POST /api/admin/projects[/{id}]`, `DELETE`, `POST .../move` | Manage projects (multipart: `cover`, `photos`, `removePhotos`) |
| `POST`, `PUT`, `DELETE /api/admin/testimonials[/{id}]`, `POST .../move` | Manage testimonials |
| `POST /api/admin/inquiries/{id}/read`, `DELETE .../{id}`, `GET .../{id}/files/{name}` | Read, delete and download inquiries |
| `PUT /api/admin/settings` | Site text and contact details |
| `PUT`, `DELETE /api/admin/instagram`, `POST /api/admin/instagram/refresh` | Connect, disconnect, fetch now |

Admin endpoints need `Authorization: Bearer <token>`. The frontend keeps the token in an
httpOnly cookie and adds the header itself, so the browser never calls the backend directly.

## Data

The backend stores its database (embedded H2), uploaded images and inquiry attachments in
`backend/data/`.
Back that folder up. `DATA_DIR` moves it; to use another database, set
`SPRING_DATASOURCE_URL` and add its JDBC driver to `pom.xml`.

## Contact form

Inquiries are stored by the backend and listed under Inquiries in the admin panel, with a
badge for unread ones. Nothing is emailed. Attachments (images or PDF, up to five of 10 MB)
are kept in `backend/data/attachments/` and can only be opened from the admin panel.

## Instagram

The feed uses the official Instagram API with Instagram Login. In the admin panel, open
Instagram and paste a long-lived access token for the company's professional account; the
page explains how to create one. After that the backend checks for new posts every 15
minutes and renews the token on its own before it expires.
