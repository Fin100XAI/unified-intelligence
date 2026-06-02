# Deployment

This is a **static frontend** — no backend, no server. Data is generated
in-browser (`src/data/mock.js`). Deploy the built `dist/` folder to any static
host.

## Build

```bash
npm install
npm run build      # outputs to dist/
```

## Host the `dist/` folder

- **Netlify / Vercel / Cloudflare Pages:** Build command `npm run build`,
  output/publish directory `dist`.
- **GitHub Pages / S3 / any static server:** upload the contents of `dist/`.
- **Local check:** `npm run preview`.

Because it's a single-page app, configure the host to fall back to
`index.html` for unknown routes (Netlify/Vercel do this automatically for SPAs).

No environment variables or database required.
