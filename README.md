# Maharashtra State Governance Nerve Center

**AI Operating Layer for Maharashtra Governance** — a premium, government-grade
State Command Center & Governance Intelligence platform (PoC) for CMO, Chief
Secretary, Principal Secretaries, MahaIT, Divisional Commissioners, District
Collectors and line departments.

> ⚠️ **All data is SIMULATED for PoC demonstration.** It is **not** real
> government data and must not be treated as official statistics. Every screen
> carries a *“Simulated Data for PoC Demonstration”* badge.

## Tech stack
- **Frontend:** React 18 + Vite, Tailwind CSS, Recharts, Lucide icons, Framer Motion, React Router
- **Backend:** Node.js + Express (simulated JSON governance data)

## Features
- 15 modules: State Command Overview, Department Health, District Governance,
  Welfare Delivery, RTS / Aaple Sarkar, MahaDBT, Revenue & Fiscal, Disaster &
  Resilience, Law & Order (governance-safe), Infrastructure, Cyber & AI Trust,
  AI Alerts & Audit Logs, District Collector / Principal Secretary / CMO views.
- 10 global filters (division, district, department, scheme, risk, period,
  urban/rural, service category, financial year, priority) — they update every
  card, chart, table and alert live.
- Dark / light mode, sticky topbar, desktop sidebar, mobile bottom-nav + drawer.
- Charts, drilldown modals, searchable / sortable / CSV-exportable tables,
  skeleton loaders, empty + error states, heatmap grids, score gauges.
- All financial values use ₹ (no `$` anywhere).
- Visible trust labels: Human-in-the-loop, DPDP-aware, RBAC, Audit-ready,
  Explainable AI, Government-controlled deployment.

## Folder structure
```
governance-intell-poc/
├─ package.json            # root: runs client + server together
├─ server/                 # Express API (simulated data)
│  ├─ index.js             # routes
│  └─ data.js              # Maharashtra master + synthetic generators
└─ client/                 # React app
   └─ src/
      ├─ api.js            # fetch hook + ₹ formatters
      ├─ context/          # ThemeContext, FilterContext
      ├─ components/       # Layout, ui primitives, charts
      ├─ data/nav.js       # nav + route config
      └─ pages/            # 15 module pages
```

## Setup & run

```bash
# 1. install everything (root + server + client)
npm run install:all

# 2. run backend (:4000) and frontend (:5173) together
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the
Express backend on port 4000.

Run individually if preferred:
```bash
npm run dev:server   # API only  → http://localhost:4000
npm run dev:client   # UI only   → http://localhost:5173
```

## API endpoints (all return `{ _meta: { simulated: true, ... }, data }`)
`/api/overview` · `/api/departments` · `/api/districts` · `/api/welfare` ·
`/api/rts` · `/api/mahadbt` · `/api/revenue` · `/api/disaster` ·
`/api/law-order` · `/api/cyber` · `/api/audit-logs` · `/api/alerts` ·
`/api/meta` (filter master data) · `/api/health`

## Notes on responsible design
- **Law & Order** module exposes only governance-safe operational signals — no
  surveillance, no personal data — and flags sensitive districts as
  responsible-access controlled.
- AI recommendations are logged, explainable and require human review
  (human-in-the-loop) on the **AI Alerts & Audit Logs** screen.
