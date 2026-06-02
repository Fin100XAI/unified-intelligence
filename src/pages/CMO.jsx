import { Crown, AlertTriangle, TrendingUp, ShieldCheck, Users, CheckCircle2, Zap, BarChart3 } from 'lucide-react';
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
  const critical = (alerts || []).filter((a) => a.priority === 'Critical').slice(0, 6);
  const totalVulnerabilities = o.deptRanking.filter(d => d.healthScore >= 75).length;

  return (
    <div className="space-y-5">
      <PageHeader title="CMO / Chief Secretary Executive View" subtitle="📊 State governance at a glance · Real-time executive decision support" icon={Crown} />

      {/* Primary Health Score Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 flex flex-col items-center justify-center gap-4 p-8 shadow-light-glow">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <ShieldCheck size={16} className="text-blue-600" /> State Governance Health
          </div>
          <ScoreGauge score={o.governanceHealthScore} size={160} label="Maharashtra" color="#0284c7" />
          <Badge level={o.governanceHealthScore >= 75 ? 'Low' : 'Medium'}>
            {o.governanceHealthScore >= 75 ? '✓ Excellent · On Track' : 'Monitor Closely'}
          </Badge>
          <p className="text-center text-[11px] text-slate-500 font-medium">Composite Index: {o.departmentsMonitored} Departments × {o.districtsMonitored} Districts</p>
        </Card>

        {/* Key Executive Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <Kpi label="Revenue Collected" value={inrCr(o.revenueCollectionCr)} sub={collectionPct + '% of target'} trend={1} icon={TrendingUp} accent="green" />
          <Kpi label="Critical Alerts" value={o.criticalAlerts} icon={AlertTriangle} accent="red" />
          <Kpi label="Beneficiaries Served" value={(o.totalBeneficiariesServed / 1000000).toFixed(1) + 'M'} trend={1} icon={Users} accent="saffron" />
          <Kpi label="Grievances Resolved" value={(o.grievancesResolved / 1000).toFixed(0) + 'K'} icon={CheckCircle2} accent="green" />
          <Kpi label="Welfare Gap" value={o.welfareGapPct.toFixed(1) + '%'} accent="navy" />
          <Kpi label="Disaster-Risk Districts" value={o.disasterRiskDistricts} accent="red" />
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Kpi label="Service Delivery" value={o.serviceDeliveryScore.toFixed(0) + '%'} icon={BarChart3} accent="saffron" />
        <Kpi label="Citizen Satisfaction" value={o.citizenSatisfaction.toFixed(0) + '%'} accent="green" />
        <Kpi label="Avg Resolution" value={o.avgResolutionDays.toFixed(1) + ' days'} accent="navy" />
        <Kpi label="Infrastructure" value={o.infrastructureProjects} accent="gold" />
        <Kpi label="Online Services" value={o.onlineServiceUsage.toFixed(0) + '%'} icon={Zap} accent="saffron" />
      </div>

      {/* Charts Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="State Governance Health Trend" height={280} subtitle="Past 12 months">
          <AreaTrend data={o.healthTrend} x="month" y="score" />
        </ChartCard>
        <ChartCard title="Department Health Ranking" height={280} subtitle="Top performers">
          <Bars data={o.deptRanking.slice(0, 8)} x="department" bars={[{ key: 'healthScore', name: 'Health Score', color: '#0284c7' }]} vertical />
        </ChartCard>
      </div>

      {/* Executive Escalation Brief */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50">
        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600" />
          <h3 className="text-lg font-bold text-red-700">⚠️ Executive Escalation Brief — Requires Immediate Attention</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(critical.length ? critical : o.topEscalations).map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-white/70 p-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{e.title}</p>
                <p className="mt-1 text-xs text-slate-600">📍 {e.district} · 🏢 {e.department}</p>
              </div>
              <Badge level={e.priority} className="flex-shrink-0">{e.priority}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Department Performance & Status Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 bg-gradient-light">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" /> High Performers
          </h4>
          <p className="text-3xl font-bold text-green-600 mb-1">{totalVulnerabilities}</p>
          <p className="text-xs text-slate-600">of {o.deptRanking.length} departments with score ≥75</p>
        </Card>

        <Card className="p-5 bg-gradient-light">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Users size={16} className="text-blue-600" /> RTS Pending
          </h4>
          <p className="text-3xl font-bold text-blue-600 mb-1">{compact(o.rtsPending)}</p>
          <p className="text-xs text-slate-600">Requests awaiting processing</p>
        </Card>

        <Card className="p-5 bg-gradient-light">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Zap size={16} className="text-yellow-600" /> Project Status
          </h4>
          <p className="text-3xl font-bold text-yellow-600 mb-1">{o.projectCompletionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-600">Infrastructure projects on track</p>
        </Card>
      </div>
    </div>
  );
}
