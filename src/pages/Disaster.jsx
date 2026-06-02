import { CloudRain, AlertTriangle } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, SkeletonGrid, ErrorState, DataTable } from '../components/ui.jsx';
import { ChartCard, RadarChartView } from '../components/charts.jsx';

export default function Disaster() {
  const { data, loading, error } = useApi('/disaster');
  const { matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Disaster & Resilience Intelligence" icon={CloudRain} /><SkeletonGrid count={4} /></>;

  const radar = Object.entries(data.risks).map(([k, v]) => ({ subject: k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), value: v }));
  const byDist = data.byDistrict.filter(matchRow);

  return (
    <div>
      <PageHeader title="Disaster & Resilience Intelligence" subtitle="Multi-hazard risk · district readiness & early warnings" icon={CloudRain} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Vulnerability Index" value={data.vulnerabilityIndex} accent="red" />
        <Kpi label="Flood Risk" value={data.risks.flood} accent="navy" />
        <Kpi label="Heatwave Risk" value={data.risks.heatwave} accent="saffron" />
        <Kpi label="Drought Risk" value={data.risks.drought} accent="gold" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Multi-Hazard Risk Profile" subtitle="Flood · Heatwave · Drought · Coastal · Urban flooding" height={320}>
          <RadarChartView data={radar} color="#ef4444" />
        </ChartCard>
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /><h3 className="text-sm font-bold">Early Warning Alert Panel</h3></div>
          <div className="space-y-2">
            {data.earlyWarnings.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div><p className="text-sm font-semibold">{w.type} — {w.district}</p><p className="text-xs text-slate-400">Issued {w.issued}</p></div>
                <Badge level={w.severity}>{w.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <DataTable title="District Readiness & Relief Resources" rows={byDist} searchKeys={['district', 'division']}
          columns={[
            { key: 'district', label: 'District' },
            { key: 'division', label: 'Division' },
            { key: 'readinessScore', label: 'Readiness', render: (v) => <Badge level={v >= 80 ? 'Low' : v >= 60 ? 'Medium' : 'High'}>{v}</Badge> },
            { key: 'floodRisk', label: 'Flood Risk' },
            { key: 'reliefResourcesPct', label: 'Relief Resources', render: (v) => v + '%' },
          ]} />
      </div>
    </div>
  );
}
