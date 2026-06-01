import { Banknote } from 'lucide-react';
import { useApi, compact, inrCr } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, SkeletonGrid, ErrorState, DataTable, Badge } from '../components/ui.jsx';
import { ChartCard, Bars } from '../components/charts.jsx';

export default function MahaDBT() {
  const { data, loading, error } = useApi('/mahadbt');
  const { filters, matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="MahaDBT Benefit Assurance" icon={Banknote} /><SkeletonGrid count={4} /></>;

  const flow = data.bySchemeFlow.filter((r) => !filters.scheme || r.scheme === filters.scheme);
  const gaps = data.byDistrictGap.filter(matchRow);

  return (
    <div>
      <PageHeader title="MahaDBT Benefit Assurance" subtitle="Direct Benefit Transfer integrity · disbursement & verification" icon={Banknote} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Disbursed" value={inrCr(data.totalDisbursedCr)} accent="green" />
        <Kpi label="Pending Disbursement" value={inrCr(data.pendingDisbursedCr)} accent="saffron" />
        <Kpi label="Failed Transactions" value={compact(data.failedTxns)} accent="red" />
        <Kpi label="Beneficiaries Verified" value={data.verifiedPct + '%'} accent="navy" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Kpi label="Bank-Linking Issues" value={compact(data.bankLinkingIssues)} accent="red" />
        <Kpi label="Duplicate Risk Flags" value={compact(data.duplicateRiskFlags)} accent="gold" />
        <Kpi label="Verification Status" value={data.verifiedPct + '% OK'} accent="green" />
      </div>

      <div className="mt-4">
        <ChartCard title="Scheme-wise DBT Flow (₹ Cr)" subtitle="Disbursed vs pending" height={340}>
          <Bars data={flow} x="scheme" bars={[
            { key: 'disbursedCr', name: 'Disbursed (₹Cr)', color: '#10b981' },
            { key: 'pendingCr', name: 'Pending (₹Cr)', color: '#0ea5e9' },
          ]} vertical />
        </ChartCard>
      </div>
      <div className="mt-4">
        <DataTable title="District-wise DBT Gap" rows={gaps} searchKeys={['district']}
          columns={[
            { key: 'district', label: 'District' },
            { key: 'gapPct', label: 'DBT Gap', render: (v) => <Badge level={v > 18 ? 'High' : v > 10 ? 'Medium' : 'Low'}>{v}%</Badge> },
          ]} />
      </div>
    </div>
  );
}
