import { TrendingUp } from 'lucide-react';
import { useApi, inrCr } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, SkeletonGrid, ErrorState, DataTable } from '../components/ui.jsx';
import { ChartCard, Bars } from '../components/charts.jsx';

export default function Revenue() {
  const { data, loading, error } = useApi('/revenue');
  const { filters, matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Revenue & Fiscal Intelligence" icon={TrendingUp} /><SkeletonGrid count={4} /></>;

  const pct = Math.round((data.collectedCr / data.targetCr) * 100);
  const exp = data.byDepartmentExpenditure.filter((r) => !filters.department || r.department === filters.department);
  const util = data.byDistrictUtilization.filter(matchRow);

  return (
    <div>
      <PageHeader title="Revenue & Fiscal Intelligence" subtitle="Collection vs target · expenditure & anomaly detection" icon={TrendingUp} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Revenue Target" value={inrCr(data.targetCr)} accent="navy" />
        <Kpi label="Collected" value={inrCr(data.collectedCr)} sub={pct + '% of target'} trend={1} accent="green" />
        <Kpi label="Fiscal Pressure Score" value={data.fiscalPressureScore} accent="red" />
        <Kpi label="Salary Burn" value={data.salaryBurnPct + '%'} accent="saffron" />
      </div>

      <Card className="mt-4 p-4">
        <h3 className="mb-1 text-sm font-bold">Revenue Collection vs Target</h3>
        <p className="text-xs text-slate-400">{inrCr(data.collectedCr)} of {inrCr(data.targetCr)}</p>
        <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-emerald-500 to-gold pr-2 text-[10px] font-bold text-white" style={{ width: pct + '%' }}>{pct}%</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Grant Utilization" v={data.grantUtilizationPct + '%'} />
          <Mini label="Procurement Efficiency" v={data.procurementEfficiencyPct + '%'} />
          <Mini label="Salary Burn" v={data.salaryBurnPct + '%'} />
          <Mini label="Fiscal Pressure" v={data.fiscalPressureScore} />
        </div>
      </Card>

      <div className="mt-4">
        <ChartCard title="Department Expenditure — Allocated vs Spent (₹ Cr)" height={340}>
          <Bars data={exp} x="department" bars={[
            { key: 'allocatedCr', name: 'Allocated', color: '#2563eb' },
            { key: 'spentCr', name: 'Spent', color: '#0ea5e9' },
          ]} vertical />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DataTable title="Budget Anomaly Flags" rows={data.anomalyFlags} searchKeys={['department', 'type']}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'department', label: 'Department' },
            { key: 'type', label: 'Anomaly' },
            { key: 'severity', label: 'Severity', render: (v) => <Badge level={v}>{v}</Badge> },
          ]} />
        <DataTable title="District-wise Fund Utilization" rows={util} searchKeys={['district']}
          columns={[
            { key: 'district', label: 'District' },
            { key: 'utilizationPct', label: 'Utilization', render: (v) => <Badge level={v >= 80 ? 'Low' : v >= 60 ? 'Medium' : 'High'}>{v}%</Badge> },
          ]} />
      </div>
    </div>
  );
}
const Mini = ({ label, v }) => <div className="rounded-lg bg-slate-500/5 p-2"><p className="text-[10px] uppercase text-slate-400">{label}</p><p className="font-bold">{v}</p></div>;
