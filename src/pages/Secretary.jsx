import { Briefcase, ListChecks } from 'lucide-react';
import { useApi, compact } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, ScoreGauge, SkeletonGrid, ErrorState } from '../components/ui.jsx';
import { ChartCard, Lines, Bars } from '../components/charts.jsx';

// Principal Secretary view — single-department portfolio cockpit.
export default function Secretary() {
  const { data, loading, error } = useApi('/departments');
  const { filters, setFilter } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Principal Secretary View" icon={Briefcase} /><SkeletonGrid count={4} /></>;

  const d = data.find((x) => x.department === filters.department) || data[0];
  const avg = (k) => Math.round(data.reduce((s, x) => s + x[k], 0) / data.length);

  // Department vs state-average benchmarks.
  const benchmark = [
    { metric: 'Health', dept: d.healthScore, state: avg('healthScore') },
    { metric: 'Budget %', dept: d.budgetUtilizationPct, state: avg('budgetUtilizationPct') },
    { metric: 'Risk', dept: d.riskScore, state: avg('riskScore') },
  ];

  // Derived recommended actions (human-in-the-loop).
  const actions = [
    { t: 'Clear pending approvals backlog', s: d.pendingApprovals > 3000 ? 'Critical' : d.pendingApprovals > 1500 ? 'High' : 'Low' },
    { t: 'Resolve SLA breaches', s: d.slaBreaches > 800 ? 'High' : d.slaBreaches > 300 ? 'Medium' : 'Low' },
    { t: 'Accelerate budget utilization', s: d.budgetUtilizationPct < 60 ? 'High' : d.budgetUtilizationPct < 80 ? 'Medium' : 'Low' },
    { t: 'Reduce grievance load', s: d.grievanceLoad > 5000 ? 'High' : d.grievanceLoad > 2000 ? 'Medium' : 'Low' },
  ];

  return (
    <div>
      <PageHeader title="Principal Secretary View" subtitle={`Department portfolio cockpit · ${d.department}`} icon={Briefcase}
        right={
          <select value={filters.department || d.department} onChange={(e) => setFilter('department', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm">
            {data.map((x) => <option key={x.department} value={x.department}>{x.department}</option>)}
          </select>
        } />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Department Health</p>
          <ScoreGauge score={d.healthScore} />
          <Badge level={d.riskLevel}>{d.riskLevel} risk</Badge>
        </Card>
        <div className="grid grid-cols-2 gap-4 lg:col-span-3">
          <Kpi label="Pending Approvals" value={compact(d.pendingApprovals)} accent="saffron" />
          <Kpi label="SLA Breaches" value={compact(d.slaBreaches)} accent="red" />
          <Kpi label="Budget Utilization" value={d.budgetUtilizationPct + '%'} accent="green" />
          <Kpi label="Grievance Load" value={compact(d.grievanceLoad)} accent="navy" />
          <Kpi label="Risk Score" value={d.riskScore} accent="red" />
          <Kpi label="Health Score" value={d.healthScore} accent="gold" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={`${d.department} — 12-Month Health Trend`} height={300}>
          <Lines data={d.trend} x="month" lines={[{ key: 'score', name: 'Health Score', color: '#2563eb' }]} />
        </ChartCard>
        <ChartCard title="Department vs State Average" subtitle="Benchmark across key metrics" height={300}>
          <Bars data={benchmark} x="metric" bars={[
            { key: 'dept', name: d.department, color: '#0ea5e9' },
            { key: 'state', name: 'State Avg', color: '#2563eb' },
          ]} />
        </ChartCard>
      </div>

      <Card className="mt-4 p-4">
        <div className="mb-3 flex items-center gap-2"><ListChecks size={16} className="text-saffron" /><h3 className="text-sm font-bold">Recommended Actions — Human-in-the-loop Approval</h3></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {actions.map((a) => (
            <div key={a.t} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm">
              <span>{a.t}</span><Badge level={a.s}>{a.s}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-slate-100 p-2 text-xs text-slate-500">All AI-suggested actions require officer approval · DPDP-aware · Audit-ready.</p>
      </Card>
    </div>
  );
}
