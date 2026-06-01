import { UserCog, Gauge } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, ScoreGauge, SkeletonGrid, ErrorState } from '../components/ui.jsx';

// District Collector view — single-district operational cockpit.
export default function Collector() {
  const { data, loading, error } = useApi('/districts');
  const { filters, setFilter } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="District Collector View" icon={UserCog} /><SkeletonGrid count={4} /></>;

  const d = data.find((x) => x.district === filters.district) || data[0];

  // Normalised 0-100 risk indicators (higher bar = higher concern).
  const indicators = [
    { label: 'RTS Backlog Pressure', v: Math.min(100, Math.round(d.rtsBacklog / 42)) },
    { label: 'Welfare Saturation Gap', v: 100 - d.welfareScore },
    { label: 'Revenue Risk', v: Math.round(d.revenueRiskPct * 3.5) },
    { label: 'Disaster Vulnerability', v: d.disasterVulnerability },
    { label: 'Infrastructure Delay Risk', v: d.infraDelayRisk },
  ];
  const bar = (v) => v >= 70 ? 'from-red-500 to-orange-500' : v >= 45 ? 'from-amber-500 to-gold' : 'from-emerald-500 to-emerald-400';

  return (
    <div>
      <PageHeader title="District Collector View" subtitle={`Operational cockpit · ${d.district} (${d.division} Division)`} icon={UserCog}
        right={
          <select value={filters.district || d.district} onChange={(e) => setFilter('district', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm">
            {data.map((x) => <option key={x.district} value={x.district}>{x.district}</option>)}
          </select>
        } />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Governance Score</p>
          <ScoreGauge score={d.governanceScore} />
          <Badge level={d.riskLevel}>{d.riskLevel} risk</Badge>
        </Card>
        <div className="grid grid-cols-2 gap-4 lg:col-span-3">
          <Kpi label="Welfare Score" value={d.welfareScore} accent="green" />
          <Kpi label="RTS Backlog" value={d.rtsBacklog} accent="saffron" />
          <Kpi label="Revenue Risk" value={d.revenueRiskPct + '%'} accent="red" />
          <Kpi label="Disaster Vulnerability" value={d.disasterVulnerability} accent="navy" />
          <Kpi label="Infra Delay Risk" value={d.infraDelayRisk + '%'} accent="gold" />
          <Kpi label="Law & Order" value={d.lawOrderLevel} accent="red" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2"><Gauge size={16} className="text-navy-600" /><h3 className="text-sm font-bold">Key Risk Indicators</h3></div>
          <div className="space-y-3">
            {indicators.map((it) => (
              <div key={it.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{it.label}</span><span className="font-bold">{it.v}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full bg-gradient-to-r ${bar(it.v)}`} style={{ width: it.v + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold">Collector Action Centre</h3>
          <div className="space-y-2 text-sm">
            {[
              { t: 'RTS backlog clearance drive', s: d.rtsBacklog > 2000 ? 'High' : 'Medium' },
              { t: 'Welfare saturation review', s: d.welfareScore < 65 ? 'High' : 'Low' },
              { t: 'Disaster readiness audit', s: d.disasterVulnerability > 65 ? 'Critical' : 'Medium' },
              { t: 'Revenue recovery monitoring', s: d.revenueRiskPct > 18 ? 'High' : 'Low' },
            ].map((a) => (
              <div key={a.t} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span>{a.t}</span><Badge level={a.s}>{a.s} priority</Badge>
              </div>
            ))}
            <div className="rounded-lg bg-slate-100 p-2 text-xs text-slate-500">Current status: <b>{d.collectorAction}</b> · Human-in-the-loop approvals required for all AI-suggested actions.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
