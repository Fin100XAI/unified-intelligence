import { useState } from 'react';
import { ScrollText, Brain, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, Modal, SkeletonGrid, ErrorState, EmptyState } from '../components/ui.jsx';

const reviewIcon = { Approved: CheckCircle2, Pending: Clock, Rejected: XCircle };
const reviewColor = { Approved: 'text-emerald-500', Pending: 'text-amber-500', Rejected: 'text-red-500' };

export default function Audit() {
  const { data, loading, error } = useApi('/audit-logs');
  const { filters } = useFilters();
  const [sel, setSel] = useState(null);
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="AI Governance Alerts & Audit Logs" icon={ScrollText} /><SkeletonGrid count={4} /></>;

  const logs = data.filter((l) =>
    (!filters.department || l.department === filters.department) &&
    (!filters.district || l.district === filters.district) &&
    (!filters.risk || l.riskCategory === filters.risk));

  return (
    <div>
      <PageHeader title="AI Governance Alerts & Audit Logs" subtitle="Every AI recommendation is logged, explainable & human-reviewed" icon={ScrollText} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total AI Recommendations" value={logs.length} accent="navy" />
        <Kpi label="Human-Approved" value={logs.filter((l) => l.humanReview === 'Approved').length} accent="green" />
        <Kpi label="Pending Review" value={logs.filter((l) => l.humanReview === 'Pending').length} accent="saffron" />
        <Kpi label="Critical Risk" value={logs.filter((l) => l.riskCategory === 'Critical').length} accent="red" />
      </div>

      {/* Timeline */}
      <Card className="mt-4 p-4">
        <h3 className="mb-4 text-sm font-bold">Audit Log Timeline</h3>
        {logs.length === 0 ? <EmptyState /> : (
          <div className="space-y-0">
            {logs.map((l, i) => {
              const RI = reviewIcon[l.humanReview] || Clock;
              return (
                <button key={l.id} onClick={() => setSel(l)}
                  className="relative flex w-full items-start gap-3 border-l-2 border-slate-200 py-3 pl-5 text-left transition hover:bg-saffron/5 dark:border-white/10">
                  <span className="absolute -left-[7px] top-4 h-3 w-3 rounded-full bg-saffron ring-4 ring-white dark:ring-navy-900" />
                  <Brain size={16} className="mt-0.5 shrink-0 text-navy-600 dark:text-blue-300" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{l.recommendation}</p>
                      <Badge level={l.riskCategory}>{l.riskCategory}</Badge>
                    </div>
                    <p className="truncate text-xs text-slate-400">{l.department} · {l.district} · {new Date(l.timestamp).toLocaleString('en-IN')}</p>
                    <p className="mt-1 line-clamp-1 text-xs italic text-slate-500">“{l.explainability}”</p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${reviewColor[l.humanReview]}`}><RI size={14} />{l.humanReview}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title="AI Recommendation — Audit Record">
        {sel && (
          <div className="space-y-3 text-sm">
            <Row label="Recommendation" v={sel.recommendation} />
            <Row label="Explainability (why)" v={sel.explainability} />
            <div className="grid grid-cols-2 gap-3">
              <Row label="Risk Category" v={<Badge level={sel.riskCategory}>{sel.riskCategory}</Badge>} />
              <Row label="Human Review" v={<span className={reviewColor[sel.humanReview]}>{sel.humanReview}</span>} />
              <Row label="Department" v={sel.department} />
              <Row label="District" v={sel.district} />
              <Row label="Officer Action" v={sel.officerAction} />
              <Row label="Compliance" v={<Badge level="Low">{sel.compliance}</Badge>} />
            </div>
            <Row label="Timestamp" v={new Date(sel.timestamp).toLocaleString('en-IN')} />
            <div className="rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-600 dark:text-emerald-300">
              Human-in-the-loop enforced · Data access logged · DPDP-aware · Audit-ready.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
const Row = ({ label, v }) => (
  <div><p className="text-xs uppercase text-slate-400">{label}</p><div className="font-medium">{v}</div></div>
);
