# Deployment

This app deploys as **one Node service**: the Express server (`/server`) serves
both the REST API (`/api/*`) and the built React frontend (`client/dist`).

## Build + run (any Node host)

```bash
npm run build      # installs deps + builds client/dist
npm start          # starts the server, which serves the SPA + API
```

The server listens on `process.env.PORT` (default `4000`). Open that URL — the
full dashboard loads, and the frontend calls `/api/*` on the same origin (no
proxy or separate frontend host needed).

## Platform settings (Render / Railway / Heroku / etc.)

| Setting        | Value             |
|----------------|-------------------|
| Build command  | `npm run build`   |
| Start command  | `npm start`       |
| Node version   | 18+               |
| Health check   | `/api/health`     |

The platform injects `PORT`; no env vars are required.

## Notes
- `client/dist` is git-ignored — it's produced by `npm run build` at deploy time.
  If your host doesn't run a build step, run `npm run build` locally and commit
  `client/dist` (remove it from `.gitignore` first).
- Data is generated in-process (no database), grounded in public figures with a
  per-minute live drift. Restarting the service is safe and stateless.
