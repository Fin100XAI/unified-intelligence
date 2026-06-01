import { useState } from 'react';
import {
  LayoutDashboard, Building2, MapPinned, AlertTriangle, FileClock, HeartHandshake,
  CloudRain, Banknote, Flame,
} from 'lucide-react';
import { useApi, compact, inrCr } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import {
  PageHeader, Kpi, Card, Badge, ScoreGauge, SkeletonGrid, ErrorState, EmptyState, riskColor,
} from '../components/ui.jsx';
import { ChartCard, AreaTrend, Bars } from '../components/charts.jsx';

export default function Overview() {
  const { data, loading, error } = useApi('/overview');
  const { data: districts } = useApi('/districts');
  const { matchRow } = useFilters();

  if (error) return <ErrorState msg={error} />;

  const o = data;
  const dlist = (districts || []).filter(matchRow);
  const collectionPct = o ? Math.round((o.revenueCollectionCr / o.revenueTargetCr) * 100) : 0;

  return (
    <div>
      <PageHeader title="State Command Overview" subtitle="Unified governance intelligence · CMO · Chief Secretary · MahaIT" icon={LayoutDashboard} />

      {loading || !o ? <SkeletonGrid count={8} /> : (
        <>
          {/* Hero: health score + top KPIs */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center gap-2 p-6 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Maharashtra Governance Health</p>
              <ScoreGauge score={o.governanceHealthScore} size={150} label="State Score" color="#1e3a8a" />
              <Badge level={o.governanceHealthScore >= 70 ? 'Medium' : 'High'}>Composite of 13 departments · 36 districts</Badge>
            </Card>

            <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-2">
              <Kpi label="Departments Monitored" value={o.departmentsMonitored} icon={Building2} accent="navy" />
              <Kpi label="Districts Monitored" value={o.districtsMonitored} icon={MapPinned} accent="gold" />
              <Kpi label="Critical Alerts" value={o.criticalAlerts} sub="Active escalations" icon={AlertTriangle} accent="red" />
              <Kpi label="RTS Pending Cases" value={compact(o.rtsPending)} icon={FileClock} accent="saffron" />
              <Kpi label="Welfare Delivery Gap" value={o.welfareGapPct + '%'} sub="Eligible vs benefited" icon={HeartHandshake} accent="navy" />
              <Kpi label="Disaster-Risk Districts" value={o.disasterRiskDistricts} icon={CloudRain} accent="red" />
            </div>
          </div>

          {/* Revenue + trend */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Revenue Collection</h3><Banknote size={18} className="text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold">{inrCr(o.revenueCollectionCr)}</p>
              <p className="text-xs text-slate-400">Target {inrCr(o.revenueTargetCr)} · FY 2025-26</p>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold" style={{ width: collectionPct + '%' }} />
              </div>
              <p className="mt-1 text-xs font-semibold text-emerald-500">{collectionPct}% of annual target achieved</p>
            </Card>
            <ChartCard title="State Governance Health Trend" subtitle="Rolling 12 months" height={220} className="lg:col-span-2">
              <AreaTrend data={o.healthTrend} x="month" y="score" />
            </ChartCard>
          </div>

          {/* Escalations + dept ranking */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2"><Flame size={16} className="text-red-500" /><h3 className="text-sm font-bold">Top 5 Priority Escalations</h3></div>
              <div className="space-y-2">
                {o.topEscalations.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{e.title}</p>
                      <p className="text-xs text-slate-400">{e.district} · {e.department} · {e.ageDays}d old</p>
                    </div>
                    <Badge level={e.priority}>{e.priority}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <ChartCard title="Department Health Ranking" subtitle="Top departments by health score" height={300}>
              <Bars data={o.deptRanking.slice(0, 8)} x="department" bars={[{ key: 'healthScore', name: 'Health Score', color: '#2563eb' }]} vertical />
            </ChartCard>
          </div>

          {/* District performance map-style grid */}
          <div className="mt-4">
            <DistrictGrid districts={dlist} />
          </div>
        </>
      )}
    </div>
  );
}

// Map-style heat grid of districts (placeholder for real Maharashtra map asset).
function DistrictGrid({ districts }) {
  const [sel, setSel] = useState(null);
  if (!districts.length) return <EmptyState />;
  const heat = (s) => s >= 80 ? 'bg-emerald-500' : s >= 65 ? 'bg-amber-400' : s >= 50 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">District Performance Map</h3>
        <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500" />Strong</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-400" />Watch</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-orange-500" />At Risk</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-500" />Critical</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {districts.map((d) => (
          <button key={d.district} onClick={() => setSel(d)}
            className={`group relative flex aspect-square flex-col items-center justify-center rounded-xl p-1.5 text-center text-white transition hover:scale-105 ${heat(d.governanceScore)}`}>
            <span className="text-lg font-extrabold">{d.governanceScore}</span>
            <span className="line-clamp-2 text-[9px] font-medium leading-tight opacity-90">{d.district}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="mt-3 rounded-xl border border-slate-200/60 bg-white/50 p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <b>{sel.district}</b><Badge level={sel.riskLevel}>{sel.riskLevel}</Badge>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
            <span>Governance: <b className="text-slate-700 dark:text-slate-200">{sel.governanceScore}</b></span>
            <span>Welfare: <b className="text-slate-700 dark:text-slate-200">{sel.welfareScore}</b></span>
            <span>RTS backlog: <b className="text-slate-700 dark:text-slate-200">{sel.rtsBacklog}</b></span>
            <span>Collector: <b className="text-slate-700 dark:text-slate-200">{sel.collectorAction}</b></span>
          </div>
        </div>
      )}
    </Card>
  );
}
