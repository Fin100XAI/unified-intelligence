// ============================================================================
// Maharashtra State Governance Nerve Center — Express API (PoC)
// All responses are SIMULATED demo data. Marked via `_meta.simulated: true`.
// ============================================================================
import express from 'express';
import cors from 'cors';
import * as D from './data.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const BASE_SEED = 42;

// Reseed per request using a 1-minute time bucket: values stay stable within a
// minute but gently drift each minute, so the dashboard feels live on refresh.
const tick = () => D.reseed(BASE_SEED + Math.floor(Date.now() / 60000));
const datasets = () => { tick(); return { districts: D.buildDistricts(), departments: D.buildDepartments() }; };

const META = {
  simulated: true,
  notice: 'Indicative data — grounded in public figures with modelled estimates. NOT official government data.',
  governance: ['Human-in-the-loop', 'DPDP-aware', 'Role-based access control', 'Audit-ready', 'Explainable AI'],
};
const wrap = (data) => ({ _meta: { ...META, generatedAt: new Date().toISOString() }, data });

// --- Global filter helper -----------------------------------------------------
// Filters that make sense server-side are applied; client also filters.
const applyDistrictFilters = (rows, q) => {
  let out = rows;
  if (q.division) out = out.filter((x) => x.division === q.division);
  if (q.district) out = out.filter((x) => (x.district || x.name) === q.district);
  if (q.risk) out = out.filter((x) => x.riskLevel === q.risk || x.level === q.risk);
  if (q.urbanRural) out = out.filter((x) => x.urbanRural === q.urbanRural);
  return out;
};

app.get('/api/health', (_req, res) => res.json({ ok: true, ...META, generatedAt: new Date().toISOString() }));

app.get('/api/overview', (_req, res) => {
  const { districts, departments } = datasets();
  res.json(wrap(D.buildOverview(districts, departments)));
});

app.get('/api/departments', (req, res) => {
  let out = datasets().departments;
  if (req.query.department) out = out.filter((d) => d.department === req.query.department);
  if (req.query.risk) out = out.filter((d) => d.riskLevel === req.query.risk);
  res.json(wrap(out));
});

app.get('/api/districts', (req, res) => res.json(wrap(applyDistrictFilters(datasets().districts, req.query))));

app.get('/api/welfare', (_req, res) => { tick(); res.json(wrap(D.buildWelfare())); });
app.get('/api/rts', (_req, res) => { tick(); res.json(wrap(D.buildRTS())); });
app.get('/api/mahadbt', (_req, res) => { tick(); res.json(wrap(D.buildMahaDBT())); });
app.get('/api/revenue', (_req, res) => { tick(); res.json(wrap(D.buildRevenue())); });
app.get('/api/disaster', (_req, res) => { tick(); res.json(wrap(D.buildDisaster())); });
app.get('/api/law-order', (_req, res) => { tick(); res.json(wrap(D.buildLawOrder())); });
app.get('/api/cyber', (_req, res) => { tick(); res.json(wrap(D.buildCyber())); });
app.get('/api/audit-logs', (_req, res) => { tick(); res.json(wrap(D.buildAuditLogs())); });
app.get('/api/alerts', (req, res) => {
  let out = D.buildAlerts(datasets().districts);
  if (req.query.priority) out = out.filter((a) => a.priority === req.query.priority);
  res.json(wrap(out));
});

// Reference master data for client-side filter dropdowns.
app.get('/api/meta', (_req, res) =>
  res.json(wrap({
    divisions: D.DIVISIONS, districts: D.DISTRICTS, departments: D.DEPARTMENTS,
    schemes: D.SCHEMES, rtsServices: D.RTS_SERVICES,
  })),
);

app.listen(PORT, () => console.log(`✅ Governance API (SIMULATED) running on http://localhost:${PORT}`));
