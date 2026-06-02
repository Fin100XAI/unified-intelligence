import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useApi, compact } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import {
  PageHeader, Kpi, Card, Badge, Modal, SkeletonGrid, ErrorState, EmptyState, DataTable, ScoreGauge,
} from '../components/ui.jsx';
import { ChartCard, Bars, Lines, Responsive } from '../components/charts.jsx';

export default function Departments() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/departments', { department: filters.department, risk: filters.risk });
  const [sel, setSel] = useState(null);

  if (error) return <ErrorState msg={error} />;
  const rows = data || [];

  const avg = (k) => rows.length ? Math.round(rows.reduce((s, d) => s + d[k], 0) / rows.length) : 0;

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
    <div>
      <PageHeader title="Department Health Intelligence" subtitle="13 departments · performance, SLA, budget & grievance risk" icon={Building2} />
      {loading ? <SkeletonGrid count={4} /> : rows.length === 0 ? <EmptyState /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Avg Health Score" value={avg('healthScore')} accent="green" />
            <Kpi label="Total Pending Approvals" value={compact(rows.reduce((s, d) => s + d.pendingApprovals, 0))} accent="saffron" />
            <Kpi label="Total SLA Breaches" value={compact(rows.reduce((s, d) => s + d.slaBreaches, 0))} accent="red" />
            <Kpi label="Avg Budget Utilization" value={avg('budgetUtilizationPct') + '%'} accent="navy" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Department Comparison — Health vs Risk" height={320}>
              <Bars data={rows} x="department" bars={[
                { key: 'healthScore', name: 'Health', color: '#10b981' },
                { key: 'riskScore', name: 'Risk', color: '#ef4444' },
              ]} vertical />
            </ChartCard>
            <ChartCard title="Pending Approvals vs Grievance Load" height={320}>
              <Bars data={rows} x="department" bars={[
                { key: 'pendingApprovals', name: 'Pending', color: '#0ea5e9' },
                { key: 'grievanceLoad', name: 'Grievances', color: '#2563eb' },
              ]} vertical />
            </ChartCard>
          </div>

          <div className="mt-4">
            <DataTable title="Department Risk Matrix" columns={columns} rows={rows} searchKeys={['department']} onRowClick={setSel} />
          </div>

          <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.department} Department` : ''}>
            {sel && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-around">
                  <ScoreGauge score={sel.healthScore} label="Health" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Pending Approvals" value={compact(sel.pendingApprovals)} />
                    <Info label="SLA Breaches" value={compact(sel.slaBreaches)} />
                    <Info label="Budget Utilization" value={sel.budgetUtilizationPct + '%'} />
                    <Info label="Grievance Load" value={compact(sel.grievanceLoad)} />
                    <Info label="Risk Score" value={sel.riskScore} />
                    <div><Badge level={sel.riskLevel}>{sel.riskLevel} risk</Badge></div>
                  </div>
                </div>
                <Card className="p-3">
                  <h4 className="mb-2 text-xs font-bold uppercase text-slate-400">12-month health trend</h4>
                  <Responsive height={200}>
                    <Lines data={sel.trend} x="month" lines={[{ key: 'score', name: 'Health', color: '#2563eb' }]} />
                  </Responsive>
                </Card>
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
