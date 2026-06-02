import { useState } from 'react';
import {
  LayoutDashboard, Building2, MapPinned, AlertTriangle, FileClock, HeartHandshake,
  CloudRain, Banknote, Flame, TrendingUp, TrendingDown, Activity, Zap,
  ShieldCheck, Users, Target, BarChart3, Radio, Brain, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useApi, compact, inrCr } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import {
  PageHeader, Kpi, Card, Badge, ScoreGauge, SkeletonGrid, ErrorState, EmptyState, riskColor, scoreColor,
} from '../components/ui.jsx';
import { ChartCard, AreaTrend, Bars } from '../components/charts.jsx';

// ---- 6 CM-GIW Governance Index Cards -----------------------------------------
const INDEX_CONFIG = [
  { key: 'stateHealthIndex',            label: 'State Health Index',           icon: ShieldCheck, color: 'blue' },
  { key: 'departmentPerformanceIndex',  label: 'Dept Performance Index',       icon: Building2,   color: 'cyan' },
  { key: 'districtPerformanceIndex',    label: 'District Performance Index',   icon: MapPinned,   color: 'violet' },
  { key: 'welfareCoverageIndex',        label: 'Welfare Coverage Index',       icon: HeartHandshake, color: 'emerald' },
  { key: 'citizenServiceIndex',         label: 'Citizen Service Index',        icon: Users,       color: 'amber' },
  { key: 'developmentProgressIndex',   label: 'Development Progress Index',   icon: Target,      color: 'rose' },
];

const INDEX_COLORS = {
  blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-100 text-blue-600',    bar: 'bg-blue-500',    badge: 'text-blue-700 bg-blue-50 ring-blue-200' },
  cyan:    { bg: 'bg-cyan-50',    icon: 'bg-cyan-100 text-cyan-600',    bar: 'bg-cyan-500',    badge: 'text-cyan-700 bg-cyan-50 ring-cyan-200' },
  violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500',  badge: 'text-violet-700 bg-violet-50 ring-violet-200' },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50 ring-emerald-200' },
  amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',  bar: 'bg-amber-500',   badge: 'text-amber-700 bg-amber-50 ring-amber-200' },
  rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-100 text-rose-600',    bar: 'bg-rose-500',    badge: 'text-rose-700 bg-rose-50 ring-rose-200' },
};

function IndexCard({ cfg, value }) {
  const c = INDEX_COLORS[cfg.color];
  const level = value >= 80 ? 'Strong' : value >= 65 ? 'Moderate' : 'At Risk';
  const levelColor = value >= 80 ? 'text-emerald-600' : value >= 65 ? 'text-amber-600' : 'text-red-500';
  const Icon = cfg.icon;
  return (
    <Card className={`p-4 ${c.bg} border-0`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`rounded-lg p-2 ${c.icon}`}><Icon size={16} /></div>
        <span className={`text-[11px] font-semibold ${levelColor}`}>{level}</span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{cfg.label}</p>
      <p className="text-2xl font-extrabold text-slate-800 mb-2">{value}</p>
      <div className="h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
        <div className={`h-full rounded-full ${c.bar} transition-all`} style={{ width: value + '%' }} />
      </div>
    </Card>
  );
}

// ---- Real-Time Red Flag Alerts -----------------------------------------------
const SEV_STYLES = {
  Critical: { card: 'bg-red-50 border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700 ring-red-200' },
  High:     { card: 'bg-orange-50 border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 ring-orange-200' },
  Medium:   { card: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700 ring-amber-200' },
  Low:      { card: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
};
const TREND_ICONS = {
  worsening: <TrendingDown size={12} className="text-red-500" />,
  stable:    <Activity     size={12} className="text-amber-500" />,
  improving: <TrendingUp   size={12} className="text-emerald-500" />,
};
const SIGNAL_SOURCES = {
  'Welfare Delivery Deterioration': 'MahaDBT · Welfare Intelligence Layer',
  'RTS SLA Breach Escalation':      'Aaple Sarkar SLA Monitor · Revenue Dept',
  'Infrastructure Project Delay Risk': 'Infrastructure Execution Monitor',
  'Budget Under-Utilisation Alert': 'Finance Intelligence · PFMS Integration',
  'Grievance Spike Detected':       'PGRS Spike Detector · Multiple Depts',
  'Monsoon Preparedness Gap':       'Disaster Intelligence · IMD Feeds',
};
const SIGNAL_ACTIONS = {
  'Welfare Delivery Deterioration': 'Deploy enrollment drive in affected districts',
  'RTS SLA Breach Escalation':      'Additional officers + Collector directive',
  'Infrastructure Project Delay Risk': 'CM Priority review meeting',
  'Budget Under-Utilisation Alert': 'Accelerate release order — Finance Dept',
  'Grievance Spike Detected':       'District Collector 48-hour action plan',
  'Monsoon Preparedness Gap':       'Emergency readiness review within 72 hours',
};

function RedFlagCard({ s }) {
  const [open, setOpen] = useState(false);
  const st = SEV_STYLES[s.severity] || SEV_STYLES.Medium;
  const confidence = s.severity === 'Critical' ? 91 : s.severity === 'High' ? 85 : 78;

  return (
    <div className={`rounded-xl border ${st.card} overflow-hidden`}>
      <button className="w-full text-left p-3.5" onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={`text-xs font-bold leading-tight ${st.text}`}>{s.signal}</p>
          <div className="flex items-center gap-1 shrink-0">
            {TREND_ICONS[s.trend]}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${st.badge}`}>{s.severity}</span>
            {open ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
          </div>
        </div>
        <p className={`text-[11px] opacity-80 mb-2 leading-snug ${st.text}`}>{s.detail}</p>
        <div className={`flex flex-wrap gap-2 text-[10px] font-medium opacity-70 ${st.text}`}>
          <span>{s.affectedDistricts} district{s.affectedDistricts !== 1 ? 's' : ''}</span>
          <span>·</span><span>{s.department}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-current/10 bg-white/60 px-3.5 py-3 space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Source</p>
              <p className="text-[11px] text-slate-700 font-medium">{SIGNAL_SOURCES[s.signal] || 'Intelligence Layer'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Suggested Action</p>
              <p className="text-[11px] text-slate-700 font-medium">{SIGNAL_ACTIONS[s.signal] || 'Officer review required'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Confidence</span>
            <div className="flex-1 h-1.5 rounded-full bg-white overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: confidence + '%' }} />
            </div>
            <span className="text-[11px] font-bold text-slate-600">{confidence}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain size={11} className="text-violet-500" />
            <span className="text-[10px] text-slate-500 font-medium">Explainable AI · Human review required before action</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskRadar({ signals }) {
  if (!signals?.length) return null;
  const criticalCount = signals.filter(s => s.severity === 'Critical').length;
  const highCount = signals.filter(s => s.severity === 'High').length;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-50 p-2"><Radio size={16} className="text-red-500 animate-pulse" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Real-Time Red Flag Alerts</h3>
            <p className="text-[11px] text-slate-400">Delay · Leakage · Grievance spike · Disaster · Scheme bottleneck · Dept underperformance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {criticalCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700 ring-1 ring-red-200">{criticalCount} Critical</span>}
          {highCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-700 ring-1 ring-orange-200">{highCount} High</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {signals.map((s) => <RedFlagCard key={s.id} s={s} />)}
      </div>
    </Card>
  );
}

// ---- Intervention Zones -------------------------------------------------------
function InterventionZones({ zones, topDistricts, atRiskDistricts }) {
  if (!zones?.length) return null;
  const impactColor = { High: 'text-red-600 bg-red-50', Medium: 'text-amber-600 bg-amber-50', Low: 'text-emerald-600 bg-emerald-50' };
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Intervention zones */}
      <Card className="p-4 lg:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-orange-50 p-2"><Zap size={16} className="text-orange-500" /></div>
          <h3 className="text-sm font-bold">High Impact Zones</h3>
        </div>
        <div className="space-y-2">
          {zones.map((z, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{z.district}</p>
                <p className="text-[11px] text-slate-400">{z.type}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${impactColor[z.impact] || impactColor.Medium}`}>{z.impact}</span>
                <p className="text-[10px] text-slate-400">{z.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top performing districts */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-emerald-50 p-2"><TrendingUp size={16} className="text-emerald-500" /></div>
          <h3 className="text-sm font-bold">Top Performing Districts</h3>
        </div>
        <div className="space-y-2">
          {(topDistricts || []).map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-slate-300">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{d.district}</p>
                  <span className="text-xs font-bold text-emerald-600">{d.score}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: d.score + '%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* At-risk districts */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-red-50 p-2"><AlertTriangle size={16} className="text-red-500" /></div>
          <h3 className="text-sm font-bold">At-Risk Districts</h3>
        </div>
        <div className="space-y-2">
          {(atRiskDistricts || []).map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{d.district}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-red-500">{d.score}</span>
                    <Badge level={d.riskLevel}>{d.riskLevel}</Badge>
                  </div>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-red-400" style={{ width: d.score + '%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---- Main Overview Page -------------------------------------------------------
export default function Overview() {
  const { data, loading, error } = useApi('/overview');
  const { data: districts } = useApi('/districts');
  const { matchRow } = useFilters();

  if (error) return <ErrorState msg={error} />;

  const o = data;
  const dlist = (districts || []).filter(matchRow);
  const collectionPct = o ? Math.round((o.revenueCollectionCr / o.revenueTargetCr) * 100) : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="State Command Overview"
        subtitle="CM Governance Intelligence War Room · Real-time State Visibility · CMO · MahaIT"
        icon={LayoutDashboard}
      />

      {loading || !o ? <SkeletonGrid count={8} /> : (
        <>
          {/* ── 6 Governance Indices ── */}
          <div>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CM-GIW Governance Indices
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {INDEX_CONFIG.map((cfg) => (
                <IndexCard key={cfg.key} cfg={cfg} value={o[cfg.key]} />
              ))}
            </div>
          </div>

          {/* ── Hero + Revenue + Trend ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* State Health Score Card */}
            <Card className="flex flex-col items-center justify-center gap-3 p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Maharashtra Governance Health
              </p>
              <ScoreGauge score={o.governanceHealthScore} size={150} label="State Score" color="#4285F4" />
              <Badge level={o.governanceHealthScore >= 70 ? 'Low' : 'Medium'}>
                Composite · {o.departmentsMonitored} Depts · {o.districtsMonitored} Districts
              </Badge>
              <div className="w-full grid grid-cols-2 gap-2 mt-1">
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-[10px] text-slate-400">Critical Alerts</p>
                  <p className="text-base font-extrabold text-red-500">{o.criticalAlerts}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-[10px] text-slate-400">Disaster-Risk</p>
                  <p className="text-base font-extrabold text-orange-500">{o.disasterRiskDistricts}</p>
                </div>
              </div>
            </Card>

            {/* Revenue Progress */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Revenue Collection</h3>
                <div className="rounded-lg bg-emerald-50 p-1.5"><Banknote size={16} className="text-emerald-600" /></div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800">{inrCr(o.revenueCollectionCr)}</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-3">Target {inrCr(o.revenueTargetCr)} · FY 2025-26</p>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all" style={{ width: collectionPct + '%' }} />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-emerald-600">{collectionPct}% of annual target</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] text-slate-400">Welfare Gap</p>
                  <p className="text-base font-bold text-orange-500">{o.welfareGapPct}%</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] text-slate-400">RTS Pending</p>
                  <p className="text-base font-bold text-blue-600">{compact(o.rtsPending)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] text-slate-400">Beneficiaries</p>
                  <p className="text-base font-bold text-emerald-600">{(o.totalBeneficiariesServed / 1e6).toFixed(1)}M</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] text-slate-400">Infra Projects</p>
                  <p className="text-base font-bold text-violet-600">{o.infrastructureProjects}</p>
                </div>
              </div>
            </Card>

            {/* Health Trend */}
            <ChartCard title="State Governance Health Trend" subtitle="Rolling 12 months" height={260}>
              <AreaTrend data={o.healthTrend} x="month" y="score" />
            </ChartCard>
          </div>

          {/* ── Risk Radar (Early Warning System) ── */}
          <RiskRadar signals={o.riskRadar} />

          {/* ── Intervention Zones + Top/At-Risk Districts ── */}
          <InterventionZones
            zones={o.interventionZones}
            topDistricts={o.topDistricts}
            atRiskDistricts={o.atRiskDistricts}
          />

          {/* ── Priority Escalations + Department Ranking ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-red-50 p-2"><Flame size={15} className="text-red-500" /></div>
                <h3 className="text-sm font-bold">Top Priority Escalations</h3>
              </div>
              <div className="space-y-2">
                {o.topEscalations.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{e.title}</p>
                      <p className="text-[11px] text-slate-400">{e.district} · {e.department} · {e.ageDays}d old</p>
                    </div>
                    <Badge level={e.priority}>{e.priority}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <ChartCard title="Department Health Ranking" subtitle="Sorted by composite health score" height={300}>
              <Bars
                data={o.deptRanking.slice(0, 8)}
                x="department"
                bars={[{ key: 'healthScore', name: 'Health Score', color: '#4285F4' }]}
                vertical
              />
            </ChartCard>
          </div>

          {/* ── District Performance Map ── */}
          <div>
            <DistrictGrid districts={dlist} />
          </div>
        </>
      )}
    </div>
  );
}

// ---- District Performance Heat Grid ------------------------------------------
function DistrictGrid({ districts }) {
  const [sel, setSel] = useState(null);
  if (!districts.length) return <EmptyState />;
  const heat = (s) =>
    s >= 80 ? 'bg-emerald-500 text-white' :
    s >= 65 ? 'bg-amber-400 text-white' :
    s >= 50 ? 'bg-orange-500 text-white' :
              'bg-red-500 text-white';

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">District Performance Map</h3>
          <p className="text-[11px] text-slate-400">Click any district for details</p>
        </div>
        <div className="hidden items-center gap-3 text-[10px] text-slate-500 sm:flex">
          {[['bg-emerald-500','Strong (80+)'],['bg-amber-400','Watch (65–79)'],['bg-orange-500','At Risk (50–64)'],['bg-red-500','Critical (<50)']].map(([bg, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded ${bg}`} />{label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {districts.map((d) => (
          <button key={d.district} onClick={() => setSel(sel?.district === d.district ? null : d)}
            className={`group relative flex aspect-square flex-col items-center justify-center rounded-xl p-1.5 text-center transition hover:scale-105 hover:shadow-md ${heat(d.governanceScore)} ${sel?.district === d.district ? 'ring-2 ring-offset-1 ring-slate-900/30' : ''}`}>
            <span className="text-lg font-extrabold">{d.governanceScore}</span>
            <span className="line-clamp-2 text-[9px] font-medium leading-tight opacity-90">{d.district}</span>
          </button>
        ))}
      </div>

      {sel && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-slate-800">{sel.district}</p>
              <p className="text-xs text-slate-400">{sel.division} Division</p>
            </div>
            <Badge level={sel.riskLevel}>{sel.riskLevel}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 sm:grid-cols-4">
            <span>Governance: <b className="text-slate-700">{sel.governanceScore}</b></span>
            <span>Welfare: <b className="text-slate-700">{sel.welfareScore}</b></span>
            <span>RTS backlog: <b className="text-slate-700">{sel.rtsBacklog.toLocaleString()}</b></span>
            <span>Collector: <b className="text-slate-700">{sel.collectorAction}</b></span>
          </div>
        </div>
      )}
    </Card>
  );
}
