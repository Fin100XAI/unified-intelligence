import { useState } from 'react';
import { MapPinned } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import {
  PageHeader, Kpi, Card, Badge, Modal, SkeletonGrid, ErrorState, EmptyState, DataTable, ScoreGauge,
} from '../components/ui.jsx';

export default function Districts() {
  const { filters, matchRow } = useFilters();
  const { data, loading, error } = useApi('/districts', { division: filters.division, district: filters.district, risk: filters.risk, urbanRural: filters.urbanRural });
  const [sel, setSel] = useState(null);

  if (error) return <ErrorState msg={error} />;
  const rows = (data || []).filter(matchRow);

  const columns = [
    { key: 'district', label: 'District' },
    { key: 'division', label: 'Division' },
    { key: 'governanceScore', label: 'Governance', render: (v) => <Badge level={v >= 80 ? 'Low' : v >= 65 ? 'Medium' : v >= 50 ? 'High' : 'Critical'}>{v}</Badge> },
    { key: 'welfareScore', label: 'Welfare' },
    { key: 'rtsBacklog', label: 'RTS Backlog' },
    { key: 'revenueRiskPct', label: 'Rev Risk %', render: (v) => v + '%' },
    { key: 'disasterVulnerability', label: 'Disaster Vuln' },
    { key: 'lawOrderLevel', label: 'Law & Order', render: (v) => <Badge level={v}>{v}</Badge> },
    { key: 'collectorAction', label: 'Collector Action' },
  ];
  const heat = (s) => s >= 80 ? 'bg-emerald-500' : s >= 65 ? 'bg-amber-400' : s >= 50 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div>
      <PageHeader title="District Governance Intelligence" subtitle="All 36 Maharashtra districts · ranking, heatmap & drilldown" icon={MapPinned} />
      {loading ? <SkeletonGrid count={4} /> : rows.length === 0 ? <EmptyState /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Districts Shown" value={rows.length} accent="navy" />
            <Kpi label="Avg Governance Score" value={Math.round(rows.reduce((s, d) => s + d.governanceScore, 0) / rows.length)} accent="green" />
            <Kpi label="Critical Districts" value={rows.filter((d) => d.riskLevel === 'Critical').length} accent="red" />
            <Kpi label="Escalated Collectors" value={rows.filter((d) => d.collectorAction === 'Escalated').length} accent="saffron" />
          </div>

          {/* Heatmap */}
          <Card className="mt-4 p-4">
            <h3 className="mb-3 text-sm font-bold">District Governance Heatmap</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
              {rows.map((d) => (
                <button key={d.district} onClick={() => setSel(d)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl p-1 text-center text-white transition hover:scale-105 ${heat(d.governanceScore)}`}>
                  <span className="text-base font-extrabold">{d.governanceScore}</span>
                  <span className="line-clamp-2 text-[9px] leading-tight opacity-90">{d.district}</span>
                </button>
              ))}
            </div>
          </Card>

          <div className="mt-4">
            <DataTable title="District Ranking Table" columns={columns} rows={rows} searchKeys={['district', 'division']} onRowClick={setSel} />
          </div>

          <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.district}>
            {sel && (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
                <ScoreGauge score={sel.governanceScore} label="Governance" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <I label="Division" v={sel.division} />
                  <I label="Welfare Score" v={sel.welfareScore} />
                  <I label="RTS Backlog" v={sel.rtsBacklog} />
                  <I label="Revenue Risk" v={sel.revenueRiskPct + '%'} />
                  <I label="Disaster Vulnerability" v={sel.disasterVulnerability} />
                  <I label="Infra Delay Risk" v={sel.infraDelayRisk + '%'} />
                  <I label="Urban/Rural" v={sel.urbanRural} />
                  <div><p className="text-xs text-slate-400">Law & Order</p><Badge level={sel.lawOrderLevel}>{sel.lawOrderLevel}</Badge></div>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
const I = ({ label, v }) => <div><p className="text-xs text-slate-400">{label}</p><p className="font-bold">{v}</p></div>;
