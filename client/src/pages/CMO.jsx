import { Crown, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useApi, compact, inrCr } from '../api.js';
import { PageHeader, Kpi, Card, Badge, ScoreGauge, SkeletonGrid, ErrorState } from '../components/ui.jsx';
import { ChartCard, AreaTrend, Bars } from '../components/charts.jsx';

// CMO / Chief Secretary executive view — top-of-state summary.
export default function CMO() {
  const { data: o, loading, error } = useApi('/overview');
  const { data: alerts } = useApi('/alerts');
  if (error) return <ErrorState msg={error} />;
  if (loading || !o) return <><PageHeader title="CMO / Chief Secretary Executive View" icon={Crown} /><SkeletonGrid count={4} /></>;

  const collectionPct = Math.round((o.revenueCollectionCr / o.revenueTargetCr) * 100);
  const critical = (alerts || []).filter((a) => a.priority === 'Critical').slice(0, 5);

  return (
    <div>
      <PageHeader title="CMO / Chief Secretary Executive View" subtitle="State-of-governance at a glance · executive decision support" icon={Crown} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-3 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" /> State Governance Health
          </div>
          <ScoreGauge score={o.governanceHealthScore} size={150} label="Maharashtra" />
          <Badge level={o.governanceHealthScore >= 70 ? 'Medium' : 'High'}>
            {o.governanceHealthScore >= 70 ? 'Stable — Monitor' : 'Needs Attention'}
          </Badge>
          <p className="text-center text-[11px] text-slate-400">Composite of {o.departmentsMonitored} departments · {o.districtsMonitored} districts</p>
        </Card>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <Kpi label="Revenue Collected" value={inrCr(o.revenueCollectionCr)} sub={collectionPct + '% of target'} trend={1} icon={TrendingUp} accent="green" />
          <Kpi label="Critical Alerts" value={o.criticalAlerts} icon={AlertTriangle} accent="red" />
          <Kpi label="RTS Pending" value={compact(o.rtsPending)} accent="saffron" />
          <Kpi label="Welfare Gap" value={o.welfareGapPct + '%'} accent="navy" />
          <Kpi label="Disaster-Risk Districts" value={o.disasterRiskDistricts} accent="red" />
          <Kpi label="Departments / Districts" value={`${o.departmentsMonitored} / ${o.districtsMonitored}`} accent="gold" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="State Governance Health Trend" height={260}><AreaTrend data={o.healthTrend} x="month" y="score" /></ChartCard>
        <ChartCard title="Department Health Ranking" height={260}>
          <Bars data={o.deptRanking.slice(0, 7)} x="department" bars={[{ key: 'healthScore', name: 'Health', color: '#2563eb' }]} vertical />
        </ChartCard>
      </div>

      <Card className="mt-4 p-4">
        <div className="mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /><h3 className="text-sm font-bold">Executive Escalation Brief — Requires Attention</h3></div>
        <div className="space-y-2">
          {(critical.length ? critical : o.topEscalations).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div><p className="text-sm font-semibold">{e.title}</p><p className="text-xs text-slate-400">{e.district} · {e.department}</p></div>
              <Badge level={e.priority}>{e.priority}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
