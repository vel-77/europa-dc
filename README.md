# Europa DC website

Website and admin panel for Europa Design Center (Glendale, CA).

- `backend/` is a Java (Spring Boot) service. It owns all data: brands, services, settings,
  uploaded logos, admin login and the Instagram feed.
- `frontend/` is a Next.js app. It renders the public home page and the admin panel, and
  gets everything from the backend's JSON API.

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
| Home page | `frontend/src/app/page.tsx`, styles in `frontend/src/app/globals.css` |
| Scroll-driven kitchen sketch | `frontend/src/components/kitchen/` (`geometry.ts` describes the drawing, `KitchenBuild.tsx` ties it to scrolling) |
| Admin panel pages | `frontend/src/app/admin/`; every change goes through `actions.ts` to the backend |
| Backend API client | `frontend/src/lib/api.ts` |
| API endpoints | `backend/.../site/PublicController.java`, `AdminController.java`, `auth/LoginController.java` |
| Brands, services, settings | `backend/.../site/SiteService.java` |
| Instagram feed | `backend/.../instagram/InstagramService.java` |
| First-run content | `backend/.../site/SiteSeeder.java` |

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/site` | Everything the home page shows |
| `GET /uploads/{name}` | An uploaded brand logo |
| `POST /api/admin/login` | Password in, session token out |
| `GET /api/admin/site` | Everything the admin panel shows |
| `POST /api/admin/brands`, `POST /api/admin/brands/{id}` | Add or update a brand (multipart form, optional `logo` file) |
| `DELETE /api/admin/brands/{id}`, `POST /api/admin/brands/{id}/move` | Remove or reorder a brand |
| `POST`, `PUT`, `DELETE /api/admin/categories[/{id}]`, `POST .../move` | Manage services |
| `PUT /api/admin/settings` | Site text and contact details |
| `PUT`, `DELETE /api/admin/instagram`, `POST /api/admin/instagram/refresh` | Connect, disconnect, fetch now |

Admin endpoints need `Authorization: Bearer <token>`. The frontend keeps the token in an
httpOnly cookie and adds the header itself, so the browser never calls the backend directly.

## Data

The backend stores its database (embedded H2) and uploaded logos in `backend/data/`.
Back that folder up. `DATA_DIR` moves it; to use another database, set
`SPRING_DATASOURCE_URL` and add its JDBC driver to `pom.xml`.

## Instagram

The feed uses the official Instagram API with Instagram Login. In the admin panel, open
Instagram and paste a long-lived access token for the company's professional account; the
page explains how to create one. After that the backend checks for new posts every 15
minutes and renews the token on its own before it expires.
