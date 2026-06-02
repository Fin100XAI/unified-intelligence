import { ShieldAlert, Lock } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, SkeletonGrid, ErrorState, DataTable } from '../components/ui.jsx';
import { ChartCard, Lines } from '../components/charts.jsx';

export default function LawOrder() {
  const { data, loading, error } = useApi('/law-order');
  const { matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Law & Order Escalation Intelligence" icon={ShieldAlert} /><SkeletonGrid count={4} /></>;

  const byDist = data.byDistrict.filter(matchRow);

  return (
    <div>
      <PageHeader title="Law & Order Escalation Intelligence" subtitle="Governance-safe operational signals — not surveillance" icon={ShieldAlert} />

      <Card className="mb-4 flex items-start gap-2 border-l-4 border-amber-500 p-3">
        <Lock size={16} className="mt-0.5 text-amber-500" />
        <p className="text-xs text-slate-600 dark:text-slate-300"><b>Responsible Access:</b> {data.notice}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Districts Monitored" value={byDist.length} accent="navy" />
        <Kpi label="High-Concentration" value={byDist.filter((d) => d.incidentConcentration > 70).length} accent="red" />
        <Kpi label="Active Coordination" value={byDist.filter((d) => d.responseStatus === 'Coordinating').length} accent="saffron" />
        <Kpi label="Admin Alerts" value={data.adminAlerts.length} accent="gold" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Escalation Trend (12 months)" height={300}>
          <Lines data={data.escalationTrend} x="month" lines={[{ key: 'escalations', name: 'Escalations', color: '#ef4444' }]} />
        </ChartCard>
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold">High-Priority Administrative Alerts</h3>
          <div className="space-y-2">
            {data.adminAlerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div><p className="text-sm font-semibold">{a.signal}</p><p className="text-xs text-slate-400">{a.district}</p></div>
                <Badge level={a.priority}>{a.priority}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-300">
            Sensitive districts (responsible access): {data.sensitiveDistricts.map((d) => d.district).join(', ')}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <DataTable title="Incident Concentration by District" rows={byDist} searchKeys={['district']}
          columns={[
            { key: 'district', label: 'District' },
            { key: 'incidentConcentration', label: 'Concentration Index' },
            { key: 'responseStatus', label: 'Response Status' },
            { key: 'level', label: 'Level', render: (v) => <Badge level={v}>{v}</Badge> },
          ]} />
      </div>
    </div>
  );
}
