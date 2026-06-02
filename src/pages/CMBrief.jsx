// ============================================================================
// CM Daily Intelligence Brief — AI-generated morning brief for the Chief Minister.
// Component 8 of the CM-GIW framework: Top 10 State Insights, Risks,
// Opportunities, and Required Interventions — with full Explainable AI layer.
// ============================================================================
import { useState } from 'react';
import {
  Newspaper, Lightbulb, AlertTriangle, TrendingUp, Zap, MapPin, Building2,
  Brain, CheckCircle2, Clock, RefreshCw, ShieldCheck, ChevronDown, ChevronUp,
  ArrowRight, Target, Activity,
} from 'lucide-react';
import { useApi } from '../api.js';
import { PageHeader, Card, Badge, SkeletonGrid, ErrorState, riskColor } from '../components/ui.jsx';

// ---- Tab configuration -------------------------------------------------------
const TABS = [
  { key: 'insights',      label: 'State Insights',     icon: Lightbulb,      color: 'blue',    count_label: '10 Insights' },
  { key: 'risks',         label: 'Active Risks',        icon: AlertTriangle,  color: 'red',     count_label: '10 Risks' },
  { key: 'opportunities', label: 'Opportunities',       icon: TrendingUp,     color: 'emerald', count_label: '10 Opportunities' },
  { key: 'interventions', label: 'Interventions',       icon: Zap,            color: 'amber',   count_label: '10 Actions' },
];

const TAB_STYLES = {
  blue:    { active: 'border-blue-500 text-blue-700 bg-blue-50',    inactive: 'text-slate-500 hover:text-blue-600', dot: 'bg-blue-500' },
  red:     { active: 'border-red-500 text-red-700 bg-red-50',       inactive: 'text-slate-500 hover:text-red-600',  dot: 'bg-red-500' },
  emerald: { active: 'border-emerald-500 text-emerald-700 bg-emerald-50', inactive: 'text-slate-500 hover:text-emerald-600', dot: 'bg-emerald-500' },
  amber:   { active: 'border-amber-500 text-amber-700 bg-amber-50', inactive: 'text-slate-500 hover:text-amber-600', dot: 'bg-amber-500' },
};

const PRIORITY_ICON = {
  Critical: <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse inline-block mr-1" />,
  High:     <span className="h-2 w-2 rounded-full bg-orange-500 inline-block mr-1" />,
  Medium:   <span className="h-2 w-2 rounded-full bg-amber-500 inline-block mr-1" />,
  Low:      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block mr-1" />,
};

// ---- Confidence bar ----------------------------------------------------------
function ConfidenceBar({ value }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 80 ? 'bg-blue-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: value + '%' }} />
      </div>
      <span className="text-[11px] font-semibold text-slate-600 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
}

// ---- Single Brief Item -------------------------------------------------------
function BriefItem({ item, index, tabColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border transition-all ${expanded ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'} bg-white overflow-hidden`}>
      {/* Header row */}
      <button className="w-full text-left p-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          {/* Number badge */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 mt-0.5">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="flex-1 min-w-0">
            {/* Priority + confidence */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge level={item.priority}>
                {PRIORITY_ICON[item.priority]}{item.priority}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Brain size={11} className="text-violet-400" />
                AI Confidence
              </span>
              <div className="w-24"><ConfidenceBar value={item.confidence} /></div>
            </div>

            {/* Title */}
            <p className="text-sm font-bold text-slate-800 leading-snug">{item.title}</p>

            {/* Geography + Department */}
            <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><MapPin size={11} />{item.geography}</span>
              <span className="flex items-center gap-1"><Building2 size={11} />{item.department}</span>
            </div>
          </div>

          <button className="rounded-lg p-1 hover:bg-slate-100 shrink-0 mt-0.5">
            {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
        </div>
      </button>

      {/* Expanded: Explainable AI layer */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
          {/* Rationale */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">AI Rationale</p>
            <p className="text-xs text-slate-600 leading-relaxed">{item.rationale}</p>
          </div>

          {/* Explainability metadata grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-white border border-slate-200 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Data Source</p>
              <p className="text-xs text-slate-700 font-medium">{item.source}</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Affected Geography</p>
              <p className="text-xs text-slate-700 font-medium flex items-center gap-1"><MapPin size={11} className="text-blue-400" />{item.geography}</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Responsible Department</p>
              <p className="text-xs text-slate-700 font-medium flex items-center gap-1"><Building2 size={11} className="text-blue-400" />{item.department}</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 ring-1 ring-violet-200">
              <Brain size={10} />Explainable AI
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
              <ShieldCheck size={10} />Human Review Required
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-200">
              <Activity size={10} />DPDP-Compliant
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Summary Stats Bar -------------------------------------------------------
function BriefSummary({ data }) {
  const criticalRisks = (data?.risks || []).filter(r => r.priority === 'Critical').length;
  const criticalInterventions = (data?.interventions || []).filter(r => r.priority === 'Critical').length;
  const highOpp = (data?.opportunities || []).filter(o => o.priority === 'High').length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="p-4 bg-blue-50 border-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-blue-500 mb-1">State Insights</p>
        <p className="text-2xl font-extrabold text-blue-700">10</p>
        <p className="text-[11px] text-blue-500 mt-1">AI-generated</p>
      </Card>
      <Card className="p-4 bg-red-50 border-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-red-500 mb-1">Active Risks</p>
        <p className="text-2xl font-extrabold text-red-700">10</p>
        <p className="text-[11px] text-red-500 mt-1">{criticalRisks} critical</p>
      </Card>
      <Card className="p-4 bg-emerald-50 border-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600 mb-1">Opportunities</p>
        <p className="text-2xl font-extrabold text-emerald-700">10</p>
        <p className="text-[11px] text-emerald-500 mt-1">{highOpp} high impact</p>
      </Card>
      <Card className="p-4 bg-amber-50 border-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600 mb-1">Interventions</p>
        <p className="text-2xl font-extrabold text-amber-700">10</p>
        <p className="text-[11px] text-amber-500 mt-1">{criticalInterventions} urgent</p>
      </Card>
    </div>
  );
}

// ---- Main Page ---------------------------------------------------------------
export default function CMBrief() {
  const [activeTab, setActiveTab] = useState('insights');
  const { data, loading, error } = useApi('/cm-brief');

  if (error) return <ErrorState msg={error} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="CM Daily Intelligence Brief"
        subtitle="AI-Generated Executive Morning Brief · Requires Human Review Before Action"
        icon={Newspaper}
      />

      {/* Brief Header Card */}
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-emerald-600">Live · Auto-refreshes every 30s</p>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">Good Morning, Chief Minister</h2>
            {data && (
              <p className="text-sm text-slate-500 mt-0.5">
                {data.date} · Generated at {data.briefTime}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
              <Brain size={13} />Explainable AI Layer Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <ShieldCheck size={13} />Human-in-the-Loop
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Clock size={13} />No Black-Box Outputs
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            <b>Governance Notice:</b> All insights are AI-generated from indicative data. Each item displays its source, rationale, confidence score, affected geography and responsible department. No recommendation should be acted upon without human review and verification.
          </p>
        </div>
      </Card>

      {/* Summary Stats */}
      {loading ? <SkeletonGrid count={4} h="h-20" /> : <BriefSummary data={data} />}

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar">
        {TABS.map((tab) => {
          const s = TAB_STYLES[tab.color];
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive ? `${s.active} border-b-2` : `border-transparent ${s.inactive}`
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {isActive && (
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${s.active}`}>
                  {tab.count_label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading || !data ? (
        <SkeletonGrid count={5} h="h-20" />
      ) : (
        <div className="space-y-2">
          {(data[activeTab] || []).map((item, i) => (
            <BriefItem
              key={item.id}
              item={item}
              index={i}
              tabColor={TABS.find(t => t.key === activeTab)?.color}
            />
          ))}
        </div>
      )}

      {/* Footer trust note */}
      <Card className="p-4 bg-slate-50 border-0">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Explainability Assurance:</span>
          {[
            { icon: Brain, label: 'Human-in-the-loop required' },
            { icon: CheckCircle2, label: 'Source-attributed' },
            { icon: ShieldCheck, label: 'Confidence-scored' },
            { icon: MapPin, label: 'Geography-tagged' },
            { icon: Building2, label: 'Department-attributed' },
            { icon: Activity, label: 'DPDP-compliant' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5">
              <Icon size={11} className="text-blue-500" />{label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
