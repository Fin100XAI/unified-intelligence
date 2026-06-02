import { HeartHandshake } from 'lucide-react';
import { useApi, compact } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, SkeletonGrid, ErrorState, EmptyState, DataTable, Badge } from '../components/ui.jsx';
import { ChartCard, Bars, Donut } from '../components/charts.jsx';

export default function Welfare() {
  const { data, loading, error } = useApi('/welfare');
  const { filters, matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Welfare Delivery Intelligence" icon={HeartHandshake} /><SkeletonGrid count={4} /></>;

  const s = data.summary;
  const schemes = data.schemes.filter((r) => !filters.scheme || r.scheme === filters.scheme);
  const byDistrict = data.byDistrict.filter(matchRow);
  const funnel = [
    { name: 'Eligible', value: s.eligible }, { name: 'Applicants', value: s.applicants },
    { name: 'Approved', value: s.approved }, { name: 'Recipients', value: s.recipients },
  ];

  return (
    <div>
      <PageHeader title="Welfare Delivery Intelligence" subtitle="Eligibility → benefit assurance funnel · scheme & district gaps" icon={HeartHandshake} />
      {schemes.length === 0 ? <EmptyState /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Eligible Citizens" value={compact(s.eligible)} accent="navy" />
            <Kpi label="Approved Beneficiaries" value={compact(s.approved)} accent="green" />
            <Kpi label="Benefit Recipients" value={compact(s.recipients)} accent="gold" />
            <Kpi label="Drop-off Rate" value={data.dropOffRatePct + '%'} accent="red" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Kpi label="Inclusion Gap" value={data.inclusionGapPct + '%'} accent="saffron" />
            <Kpi label="DBT Delay Risk" value={data.dbtDelayRiskPct + '%'} accent="red" />
            <Kpi label="Applicants" value={compact(s.applicants)} accent="navy" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Welfare Delivery Funnel" subtitle="Eligible → Recipients" height={300}>
              <Bars data={funnel} x="name" bars={[{ key: 'value', name: 'Citizens', color: '#4285F4' }]} />
            </ChartCard>
            <ChartCard title="Scheme-wise Eligible vs Approved" height={300}>
              <Bars data={schemes} x="scheme" bars={[
                { key: 'eligible', name: 'Eligible', color: '#4285F4' },
                { key: 'approved', name: 'Approved', color: '#FBBC05' },
              ]} vertical />
            </ChartCard>
          </div>

          <div className="mt-4">
            <DataTable title="Scheme Gap Intelligence" rows={schemes} searchKeys={['scheme']}
              columns={[
                { key: 'scheme', label: 'Scheme' },
                { key: 'eligible', label: 'Eligible', render: compact },
                { key: 'approved', label: 'Approved', render: compact },
                { key: 'gapPct', label: 'Inclusion Gap', render: (v) => <Badge level={v > 25 ? 'High' : v > 15 ? 'Medium' : 'Low'}>{v}%</Badge> },
              ]} />
          </div>
          <div className="mt-4">
            <DataTable title="District-wise Welfare Gap" rows={byDistrict} searchKeys={['district']}
              columns={[
                { key: 'district', label: 'District' },
                { key: 'division', label: 'Division' },
                { key: 'welfareGapPct', label: 'Welfare Gap', render: (v) => <Badge level={v > 25 ? 'High' : v > 15 ? 'Medium' : 'Low'}>{v}%</Badge> },
              ]} />
          </div>
        </>
      )}
    </div>
  );
}
