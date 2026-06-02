import { FileClock } from 'lucide-react';
import { useApi, compact } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, SkeletonGrid, ErrorState, DataTable } from '../components/ui.jsx';
import { ChartCard, Bars } from '../components/charts.jsx';

export default function RTS() {
  const { data, loading, error } = useApi('/rts');
  const { filters, matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="RTS / Aaple Sarkar Backlog Monitoring" icon={FileClock} /><SkeletonGrid count={4} /></>;

  const byDept = data.byDepartment.filter((r) => !filters.department || r.department === filters.department);
  const byDist = data.byDistrict.filter(matchRow);

  return (
    <div>
      <PageHeader title="RTS / Aaple Sarkar Backlog Monitoring" subtitle="Right to Services · SLA breach risk & escalation" icon={FileClock} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Applications" value={compact(data.total)} accent="navy" />
        <Kpi label="Pending Applications" value={compact(data.pending)} accent="saffron" />
        <Kpi label="SLA Breached" value={compact(data.slaBreached)} accent="red" />
        <Kpi label="Avg Disposal Time" value={data.avgDisposalDays + ' days'} accent="gold" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Department-wise Backlog vs Breaches" height={320}>
          <Bars data={byDept} x="department" bars={[
            { key: 'backlog', name: 'Backlog', color: '#4285F4' },
            { key: 'breached', name: 'Breached', color: '#EA4335' },
          ]} vertical />
        </ChartCard>
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold">High-Risk Services (SLA Breach Risk)</h3>
          <div className="space-y-2">
            {data.highRiskServices.map((sv) => (
              <div key={sv.service} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm">{sv.service}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: sv.breachRiskPct * 2 + '%' }} />
                </div>
                <Badge level={sv.breachRiskPct > 30 ? 'High' : 'Medium'}>{sv.breachRiskPct}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <DataTable title="Escalation Queue" rows={data.escalationQueue} searchKeys={['service', 'district']}
          columns={[
            { key: 'id', label: 'Case ID' },
            { key: 'service', label: 'Service' },
            { key: 'district', label: 'District' },
            { key: 'daysOverSLA', label: 'Days over SLA' },
            { key: 'priority', label: 'Priority', render: (v) => <Badge level={v}>{v}</Badge> },
          ]} />
      </div>
      <div className="mt-4">
        <DataTable title="District-wise RTS Performance" rows={byDist} searchKeys={['district']}
          columns={[
            { key: 'district', label: 'District' },
            { key: 'performance', label: 'Performance', render: (v) => <Badge level={v >= 80 ? 'Low' : v >= 65 ? 'Medium' : 'High'}>{v}%</Badge> },
            { key: 'backlog', label: 'Backlog', render: compact },
          ]} />
      </div>
    </div>
  );
}
