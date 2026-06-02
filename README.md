# Maharashtra State Governance Nerve Center

**AI Operating Layer for Maharashtra Governance** — a premium, government-grade
State Command Center & Governance Intelligence platform (PoC) for CMO, Chief
Secretary, Principal Secretaries, MahaIT, Divisional Commissioners, District
Collectors and line departments.

> ⚠️ **Figures are INDICATIVE for PoC demonstration** — grounded in public
> Maharashtra statistics with modelled estimates. **Not** official government
> data. Every screen carries an *“Indicative Data”* badge.

## Tech stack
- **Frontend only (no backend):** React 18 + Vite, Tailwind CSS, Recharts, Lucide icons, Framer Motion, React Router
- **Data:** generated in-app (`src/data/mock.js`) with a per-minute live drift

## Features
- 15 modules: State Command Overview, Department Health, District Governance,
  Welfare Delivery, RTS / Aaple Sarkar, MahaDBT, Revenue & Fiscal, Disaster &
  Resilience, Law & Order (governance-safe), Infrastructure, Cyber & AI Trust,
  AI Alerts & Audit Logs, District Collector / Principal Secretary / CMO views.
- 10 global filters (division, district, department, scheme, risk, period,
  urban/rural, service category, financial year, priority) — they update every
  card, chart, table and alert live.
- Clean white government-grade theme, sticky topbar, desktop sidebar, mobile bottom-nav + drawer.
- Charts, drilldown modals, searchable / sortable / CSV-exportable tables,
  skeleton loaders, empty + error states, heatmap grids, score gauges.
- All financial values use ₹ (no `$` anywhere).
- Visible trust labels: Human-in-the-loop, DPDP-aware, RBAC, Audit-ready,
  Explainable AI, Government-controlled deployment.

## Folder structure
```
unified-poc/                # single Vite app — no server
├─ package.json
├─ index.html
├─ vite.config.js · tailwind.config.js · postcss.config.js
├─ dist/                    # production build (npm run build)
└─ src/
   ├─ api.js                # in-app data hook + ₹ formatters
   ├─ data/mock.js          # Maharashtra master data + indicative generators
   ├─ data/nav.js           # nav + route config
   ├─ context/              # ThemeContext, FilterContext
   ├─ components/           # Layout, ui primitives, charts
   └─ pages/                # 15 module pages
```

## Setup & run

```bash
npm install      # install dependencies
npm run dev      # dev server → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the built dist/
```

There is no backend — all data is produced client-side in `src/data/mock.js`
(same contract the pages used before, exposed via `getData(path, params)`).

## Notes on responsible design
- **Law & Order** module exposes only governance-safe operational signals — no
  surveillance, no personal data — and flags sensitive districts as
  responsible-access controlled.
- AI recommendations are logged, explainable and require human review
  (human-in-the-loop) on the **AI Alerts & Audit Logs** screen.
