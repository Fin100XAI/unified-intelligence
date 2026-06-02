import { useState } from 'react';
import { Building2, Brain, ShieldCheck, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApi, compact } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import {
  PageHeader, Kpi, Card, Badge, Modal, SkeletonGrid, ErrorState, EmptyState, DataTable, ScoreGauge,
} from '../components/ui.jsx';
import { ChartCard, Bars, Lines, Responsive, RadarChartView } from '../components/charts.jsx';

// ── Department Performance Radar — 5-axis per-dept view ──────────────────────
function DeptRadar({ dept }) {
  const radarData = [
    { subject: 'Health Score',     value: dept.healthScore },
    { subject: 'Budget Util.',     value: Math.round(dept.budgetUtilizationPct) },
    { subject: 'SLA Compliance',   value: Math.max(0, Math.round(100 - dept.slaBreaches / 14)) },
    { subject: 'Grievance Mgmt',   value: Math.max(0, Math.round(100 - dept.grievanceLoad / 80)) },
    { subject: 'Risk Control',     value: Math.max(0, 100 - dept.riskScore) },
  ];
  const overallScore = Math.round(radarData.reduce((s, d) => s + d.value, 0) / radarData.length);
  return (
    <Card className="p-4 bg-blue-50 border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">Department Performance Radar</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">5-axis composite analysis</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-blue-600">{overallScore}</p>
          <p className="text-[10px] text-slate-400">Composite Score</p>
        </div>
      </div>
      <Responsive height={200}>
        <RadarChartView data={radarData} color="#4285F4" />
      </Responsive>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {radarData.map(d => (
          <div key={d.subject} className="text-center">
            <p className="text-xs font-bold text-slate-700">{d.value}</p>
            <p className="text-[9px] text-slate-400 leading-tight">{d.subject}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── AI Explanation Panel ──────────────────────────────────────────────────────
function AIExplanationPanel({ dept }) {
  const rationale =
    dept.riskLevel === 'Critical' ? `Critical risk detected — health score ${dept.healthScore} is below threshold. SLA breach rate and grievance load are ${dept.slaBreaches > 800 ? 'significantly elevated' : 'elevated'}. Immediate intervention recommended.` :
    dept.riskLevel === 'High'     ? `High risk: ${dept.pendingApprovals > 3000 ? 'Large pending approvals backlog' : 'SLA breach trend rising'}. Budget utilization at ${dept.budgetUtilizationPct}% — ${dept.budgetUtilizationPct < 60 ? 'under-utilizing allocated funds' : 'on track'}. Officer review advised.` :
    dept.riskLevel === 'Medium'   ? `Moderate performance. Health at ${dept.healthScore}. ${dept.slaBreaches > 500 ? 'SLA breaches need attention' : 'SLA performance acceptable'}. No immediate escalation needed.` :
    `Strong performance — health score ${dept.healthScore}. Budget utilization ${dept.budgetUtilizationPct}%. SLA compliance within norms. Continue monitoring.`;

  const confidence = dept.riskLevel === 'Critical' ? 91 : dept.riskLevel === 'High' ? 86 : dept.riskLevel === 'Medium' ? 82 : 88;

  return (
    <Card className="p-4 bg-violet-50 border-violet-100">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={15} className="text-violet-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">AI Explanation Panel</h4>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">AI Analysis</p>
          <p className="text-xs text-slate-700 leading-relaxed">{rationale}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white border border-violet-100 p-2.5">
            <p className="text-[10px] font-bold text-slate-400 mb-1">AI Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500" style={{ width: confidence + '%' }} />
              </div>
              <span className="text-xs font-bold text-violet-600">{confidence}%</span>
            </div>
          </div>
          <div className="rounded-lg bg-white border border-violet-100 p-2.5">
            <p className="text-[10px] font-bold text-slate-400 mb-1">Data Source</p>
            <p className="text-[11px] text-slate-700 font-medium">Dept Intelligence Layer · PFMS · PGRS</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { icon: Brain,        label: 'Explainable AI',    cls: 'bg-violet-50 text-violet-600 ring-violet-200' },
            { icon: ShieldCheck,  label: 'Human Review Req.', cls: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
            { icon: Activity,     label: 'Audit-Ready',       cls: 'bg-blue-50 text-blue-600 ring-blue-200' },
          ].map(({ icon: I, label, cls }) => (
            <span key={label} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>
              <I size={10} />{label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Departments() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/departments', { department: filters.department, risk: filters.risk });
  const [sel, setSel] = useState(null);

  if (error) return <ErrorState msg={error} />;
  const rows = data || [];
  const avg = (k) => rows.length ? Math.round(rows.reduce((s, d) => s + d[k], 0) / rows.length) : 0;

  // Grouped risk counts for mini summary
  const riskCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  rows.forEach(d => { riskCounts[d.riskLevel] = (riskCounts[d.riskLevel] || 0) + 1; });

  const columns = [
    { key: 'department', label: 'Department' },
    { key: 'healthScore', label: 'Health', render: (v) => <Badge level={v >= 80 ? 'Low' : v >= 65 ? 'Medium' : v >= 50 ? 'High' : 'Critical'}>{v}</Badge> },
    { key: 'pendingApprovals', label: 'Pending', render: compact },
    { key: 'slaBreaches', label: 'SLA Breaches', render: compact },
    { key: 'budgetUtilizationPct', label: 'Budget %', render: (v) => v + '%' },
    { key: 'grievanceLoad', label: 'Grievances', render: compact },
    { key: 'riskLevel', label: 'Risk', render: (v) => <Badge level={v}>{v}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Department Health Intelligence"
        subtitle="AI Governance Intelligence Cell · 13 departments · performance, SLA, budget & grievance risk"
        icon={Building2}
      />

      {loading ? <SkeletonGrid count={4} /> : rows.length === 0 ? <EmptyState /> : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Avg Health Score"        value={avg('healthScore')}                                              accent="navy"    />
            <Kpi label="Total Pending Approvals" value={compact(rows.reduce((s, d) => s + d.pendingApprovals, 0))}       accent="saffron" />
            <Kpi label="Total SLA Breaches"      value={compact(rows.reduce((s, d) => s + d.slaBreaches, 0))}            accent="red"     />
            <Kpi label="Avg Budget Utilization"  value={avg('budgetUtilizationPct') + '%'}                               accent="navy"    />
          </div>

          {/* Risk distribution mini-bar */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Department Risk Distribution</h3>
              <p className="text-xs text-slate-400">{rows.length} departments monitored</p>
            </div>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden">
              {Object.entries(riskCounts).map(([level, count]) => {
                if (!count) return null;
                const w = Math.round((count / rows.length) * 100);
                const bg = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-amber-400', Low: 'bg-emerald-500' }[level];
                return <div key={level} className={`${bg} transition-all`} style={{ width: w + '%' }} title={`${level}: ${count}`} />;
              })}
            </div>
            <div className="flex gap-4 mt-2">
              {Object.entries(riskCounts).map(([level, count]) => (
                <span key={level} className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${{ Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-amber-400', Low: 'bg-emerald-500' }[level]}`} />
                  {level}: <b className="text-slate-700">{count}</b>
                </span>
              ))}
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Department Performance Radar — Health vs Risk" height={320}>
              <Bars data={rows} x="department" bars={[
                { key: 'healthScore', name: 'Health', color: '#34A853' },
                { key: 'riskScore',   name: 'Risk',   color: '#EA4335' },
              ]} vertical />
            </ChartCard>
            <ChartCard title="Pending Approvals vs Grievance Load" height={320}>
              <Bars data={rows} x="department" bars={[
                { key: 'pendingApprovals', name: 'Pending',    color: '#4285F4' },
                { key: 'grievanceLoad',    name: 'Grievances', color: '#FF6D00' },
              ]} vertical />
            </ChartCard>
          </div>

          {/* Table */}
          <DataTable
            title="Department Risk Matrix — click row for AI drill-down"
            columns={columns} rows={rows}
            searchKeys={['department']}
            onRowClick={setSel}
          />

          {/* Modal: full AI drill-down */}
          <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.department} — AI Intelligence View` : ''}>
            {sel && (
              <div className="space-y-4">
                {/* Score + metrics */}
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-around">
                  <ScoreGauge score={sel.healthScore} label="Health" color="#4285F4" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Pending Approvals"  value={compact(sel.pendingApprovals)} />
                    <Info label="SLA Breaches"        value={compact(sel.slaBreaches)} />
                    <Info label="Budget Utilization"  value={sel.budgetUtilizationPct + '%'} />
                    <Info label="Grievance Load"       value={compact(sel.grievanceLoad)} />
                    <Info label="Risk Score"           value={sel.riskScore} />
                    <div><Badge level={sel.riskLevel}>{sel.riskLevel} risk</Badge></div>
                  </div>
                </div>

                {/* Department Performance Radar */}
                <DeptRadar dept={sel} />

                {/* 12-month trend */}
                <Card className="p-3">
                  <h4 className="mb-2 text-xs font-bold uppercase text-slate-400">12-Month Health Trend</h4>
                  <Responsive height={180}>
                    <Lines data={sel.trend} x="month" lines={[{ key: 'score', name: 'Health', color: '#4285F4' }]} />
                  </Responsive>
                </Card>

                {/* AI Explanation Panel */}
                <AIExplanationPanel dept={sel} />
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}

const Info = ({ label, value }) => (
  <div><p className="text-xs text-slate-400">{label}</p><p className="font-bold">{value}</p></div>
);
