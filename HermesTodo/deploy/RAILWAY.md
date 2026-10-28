# HermesTodo: GitHub-sourced production deployment

GitHub Pages is **static**. It cannot execute the Express API, securely hold the AI
API key, or persist a shared SQLite database. To publish a *real* app from GitHub,
connect this repository to a managed container host such as Railway. The resulting
production URL is the managed host's HTTPS domain, not the GitHub Pages preview.

## GitHub repository source

- Repository: `raynacocobobobo-arch/DND`
- Branch: `feature/hermestodo-dashboard-subtasks-20261025`
- Service root directory: `/HermesTodo`
- Dockerfile: `HermesTodo/Dockerfile` relative to repository root,
  or `Dockerfile` relative to the service root.
- Config as code: `HermesTodo/railway.json`
- Health check: `/api/health`

The Docker image contains **both** the real React frontend and the Express API,
served from one HTTPS origin. Never enable `VITE_STATIC_PREVIEW` or
`HERMESTODO_PREVIEW` on the production service.

## Required private variables

Set these in the hosting provider's private environment settings, not in GitHub
source, GitHub Pages, or a frontend `VITE_` variable:

- `AUTH_PASSWORD_HASH`: Argon2id hash; generate with `npm run password:hash`.
- `SESSION_SECRET`: cryptographically random string at least 32 characters.
- `ARK_API_KEY`: your Ark AI service key.
- `PUBLIC_ORIGIN`: **exact** generated production HTTPS origin, without a trailing slash.
- `COOKIE_SECURE=true`
- `DATABASE_PATH=/app/data/hermestodo.sqlite`
- `BACKUP_DIRECTORY=/app/backups`

The platform supplies `PORT`; the app listens on `0.0.0.0:PORT`.
Do not set `PUBLIC_ORIGIN` to the GitHub Pages URL: cookies, login, and
protected API requests are deliberately same-origin.

## Persistent storage — mandatory before first real task

Create and attach a persistent volume at `/app/data` *before* launching the
production app. SQLite must not live on an ephemeral container filesystem.
Make sure the volume is writable by the container's `node` user. For backups,
also mount a persistent volume at `/app/backups` or export backups regularly.
Without persistent storage, do not use the service for real tasks.

The production service is independent of the existing Tencent Cloud database.
**It will start with an empty database** unless you deliberately and securely
migrate a verified backup. Do not assume existing tasks automatically transfer.
Do not expose the SQLite file or backups as static assets.

## GitHub Pages preview

The existing `/DND/hermestodo/` GitHub Pages build remains a browser-local
interactive **demo** and is not the production database. Keep that preview
clearly labeled until a working, authenticated production deployment is
verified end-to-end.

## Go-live verification

1. Confirm `GET /api/health` returns `{"status":"ok"}` over trusted HTTPS.
2. Confirm password login sets an HttpOnly, Secure, SameSite=Lax cookie.
3. Create a test task, refresh, and open the same URL on a second device.
4. Confirm the task persists and can be completed on either device.
5. Confirm a real AI request works server-side without leaking `ARK_API_KEY`.
6. Confirm database and backup volumes survive a container redeploy.

Never publish credentials, database files, or backups to GitHub.
