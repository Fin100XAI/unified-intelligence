// ============================================================================
// CM Priority Tracker — 25 Flagship Promises, Projects, Announcements &
// Cabinet Decisions with AI Explanation Panel and Human-in-the-Loop status.
// ============================================================================
import { useState } from 'react';
import {
  ListChecks, ChevronDown, ChevronUp, Brain, ShieldCheck, MapPin, Building2,
  Activity, CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Target, Megaphone, FolderKanban, Gavel, Star,
} from 'lucide-react';
import { useApi } from '../api.js';
import { PageHeader, Card, Badge, SkeletonGrid, ErrorState } from '../components/ui.jsx';

// ── Category config ────────────────────────────────────────────────────────────
const CAT = {
  'Promise':          { icon: Star,          bg: 'bg-blue-50',   ring: 'ring-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  'Project':          { icon: FolderKanban,  bg: 'bg-violet-50', ring: 'ring-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  'Announcement':     { icon: Megaphone,     bg: 'bg-amber-50',  ring: 'ring-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  'Cabinet Decision': { icon: Gavel,         bg: 'bg-rose-50',   ring: 'ring-rose-200',   text: 'text-rose-700',   dot: 'bg-rose-500'   },
};

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  'On Track':  { color: 'text-emerald-700 bg-emerald-50 ring-emerald-200', bar: 'bg-emerald-500', icon: CheckCircle2 },
  'At Risk':   { color: 'text-amber-700 bg-amber-50 ring-amber-200',       bar: 'bg-amber-500',   icon: AlertTriangle },
  'Delayed':   { color: 'text-red-700 bg-red-50 ring-red-200',             bar: 'bg-red-500',     icon: TrendingDown  },
  'Completed': { color: 'text-blue-700 bg-blue-50 ring-blue-200',          bar: 'bg-blue-500',    icon: CheckCircle2  },
};

const AI_SIGNAL = {
  Low:      'text-emerald-600 bg-emerald-50 ring-emerald-200',
  Medium:   'text-amber-600 bg-amber-50 ring-amber-200',
  High:     'text-orange-600 bg-orange-50 ring-orange-200',
  Critical: 'text-red-600 bg-red-50 ring-red-200',
};

// ── Confidence bar ─────────────────────────────────────────────────────────────
function ConfBar({ v }) {
  const c = v >= 90 ? 'bg-emerald-500' : v >= 80 ? 'bg-blue-500' : v >= 70 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${c}`} style={{ width: v + '%' }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums">{v}%</span>
    </div>
  );
}

// ── Single Priority Item ───────────────────────────────────────────────────────
function PriorityItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const cat   = CAT[item.category]   || CAT['Promise'];
  const stat  = STATUS[item.status]  || STATUS['On Track'];
  const CatIcon = cat.icon;
  const StatIcon = stat.icon;

  return (
    <div className={`rounded-xl border bg-white overflow-hidden transition-all ${open ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
      {/* ── Collapsed row ── */}
      <button className="w-full text-left px-4 py-3.5" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          {/* Serial */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${cat.bg} ${cat.ring} ${cat.text}`}>
                <CatIcon size={10} />{item.category}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${stat.color}`}>
                <StatIcon size={10} />{item.status}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${AI_SIGNAL[item.aiSignal]}`}>
                <Brain size={10} />AI: {item.aiSignal}
              </span>
            </div>
            {/* Title */}
            <p className="text-sm font-bold text-slate-800 leading-snug">{item.title}</p>
            {/* Meta */}
            <p className="mt-0.5 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1"><Building2 size={10} />{item.department}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={10} />Target: {item.targetDate}</span>
            </p>
          </div>

          {/* Progress gauge */}
          <div className="shrink-0 flex flex-col items-end gap-1.5 min-w-[70px]">
            <p className="text-2xl font-extrabold text-slate-700 tabular-nums">{item.progressPct}%</p>
            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${stat.bar}`} style={{ width: item.progressPct + '%' }} />
            </div>
          </div>

          <div className="ml-1 rounded-lg p-1 hover:bg-slate-100 shrink-0">
            {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
          </div>
        </div>
      </button>

      {/* ── AI Explanation Panel ── */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-3">
          {/* Last milestone */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Milestone</p>
            <p className="text-xs text-slate-700 leading-relaxed">{item.lastMilestone}</p>
          </div>

          {/* AI rationale + confidence */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">AI Signal Rationale</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">{item.aiRationale}</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-medium">AI Confidence</span>
              <ConfBar v={item.confidence} />
            </div>
          </div>

          {/* Officer review */}
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Officer Review Status</p>
            <p className="text-xs text-slate-700">{item.officerReview}</p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              { icon: Brain,       label: 'Explainable AI',       cls: 'bg-violet-50 text-violet-600 ring-violet-200' },
              { icon: ShieldCheck, label: 'Human-in-the-Loop',    cls: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
              { icon: Activity,    label: 'Audit-Ready',          cls: 'bg-blue-50 text-blue-600 ring-blue-200' },
              { icon: Target,      label: 'DPDP-Compliant',       cls: 'bg-slate-100 text-slate-600 ring-slate-200' },
            ].map(({ icon: I, label, cls }) => (
              <span key={label} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>
                <I size={10} />{label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary strip ─────────────────────────────────────────────────────────────
function SummaryStrip({ items }) {
  const counts = {
    total:     items.length,
    onTrack:   items.filter(d => d.status === 'On Track').length,
    atRisk:    items.filter(d => d.status === 'At Risk').length,
    delayed:   items.filter(d => d.status === 'Delayed').length,
    completed: items.filter(d => d.status === 'Completed').length,
  };
  const overallPct = Math.round(items.reduce((s, d) => s + d.progressPct, 0) / items.length);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card className="p-4 lg:col-span-2 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="rotate-[-90deg]" width="64" height="64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="7" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="#4285F4" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallPct / 100)}`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-700">{overallPct}%</span>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Overall Progress</p>
          <p className="text-2xl font-extrabold text-slate-800">{counts.total} Items</p>
          <p className="text-[11px] text-slate-400">Flagship promises · projects · decisions</p>
        </div>
      </Card>

      {[
        { label: 'On Track',   value: counts.onTrack,   cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        { label: 'At Risk',    value: counts.atRisk,    cls: 'text-amber-700 bg-amber-50 border-amber-200'   },
        { label: 'Delayed',    value: counts.delayed,   cls: 'text-red-700 bg-red-50 border-red-200'         },
        { label: 'Completed',  value: counts.completed, cls: 'text-blue-700 bg-blue-50 border-blue-200'       },
      ].map(({ label, value, cls }) => (
        <Card key={label} className={`p-4 border ${cls}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 mb-1">{label}</p>
          <p className="text-3xl font-extrabold">{value}</p>
          <p className="text-[11px] opacity-60 mt-1">of {counts.total} items</p>
        </Card>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Promise', 'Project', 'Announcement', 'Cabinet Decision'];

export default function CMPriority() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { data, loading, error } = useApi('/cm-priority');

  if (error) return <ErrorState msg={error} />;

  const items = data || [];
  const filtered = activeFilter === 'All' ? items : items.filter(d => d.category === activeFilter);

  return (
    <div className="space-y-5">
      <PageHeader
        title="CM Priority Tracker"
        subtitle="AI Governance Intelligence Cell · 25 Flagship Promises · Projects · Announcements · Cabinet Decisions"
        icon={ListChecks}
      />

      {/* Governance Model Notice */}
      <Card className="p-4 border-l-4 border-blue-500 bg-blue-50 border-0">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Brain size={16} className="text-blue-600 mt-0.5" />
            <p className="text-xs font-bold text-blue-700">AI Governance Intelligence Cell — Operating Model</p>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            Each item is monitored by the AI layer for progress signals, delay risks, and intervention needs.
            All AI insights carry source attribution, confidence scores, and officer review records.
            <b> Final authority remains with government officers only.</b>
          </p>
        </div>
      </Card>

      {/* Summary */}
      {loading ? <SkeletonGrid count={6} h="h-20" /> : <SummaryStrip items={items} />}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const catConf = CAT[f];
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {catConf && <catConf.icon size={12} />}
              {f}
              {!loading && (
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {f === 'All' ? items.length : items.filter(d => d.category === f).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Priority Items */}
      {loading ? (
        <SkeletonGrid count={6} h="h-20" />
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <PriorityItem key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      {/* Footer trust note */}
      <Card className="p-4 bg-slate-50 border-0">
        <div className="flex flex-wrap gap-2 items-center text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Governance Assurance:</span>
          {[
            'AI signal + human review required before action',
            'Source-attributed milestones',
            'Confidence-scored AI analysis',
            'Complete officer review audit trail',
            'DPDP-compliant data handling',
          ].map(t => (
            <span key={t} className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5">{t}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
