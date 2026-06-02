import { HardHat } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, SkeletonGrid, ErrorState, EmptyState, DataTable } from '../components/ui.jsx';
import { ChartCard, Bars } from '../components/charts.jsx';

// Derives infrastructure delay-prediction view from district intelligence.
const PROJECTS = ['State Highway', 'Smart City', 'Water Supply', 'Metro Phase', 'Irrigation', 'Health Facility', 'School Block'];

export default function Infrastructure() {
  const { data, loading, error } = useApi('/districts');
  const { filters, matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Infrastructure Project Monitoring" icon={HardHat} /><SkeletonGrid count={4} /></>;

  const districts = data.filter(matchRow);
  const projects = districts.map((d, i) => ({
    project: `${PROJECTS[i % PROJECTS.length]} · ${d.district}`,
    district: d.district, division: d.division,
    delayRisk: d.infraDelayRisk,
    status: d.infraDelayRisk > 60 ? 'High Delay Risk' : d.infraDelayRisk > 35 ? 'Watch' : 'On Track',
    level: d.infraDelayRisk > 60 ? 'High' : d.infraDelayRisk > 35 ? 'Medium' : 'Low',
  }));

  if (!projects.length) return <><PageHeader title="Infrastructure Project Monitoring" icon={HardHat} /><EmptyState /></>;
  const avg = Math.round(projects.reduce((s, p) => s + p.delayRisk, 0) / projects.length);
  const topRisk = [...projects].sort((a, b) => b.delayRisk - a.delayRisk).slice(0, 8);

  return (
    <div>
      <PageHeader title="Infrastructure Project Monitoring" subtitle="AI-driven delay prediction across capital projects" icon={HardHat} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Projects Tracked" value={projects.length} accent="navy" />
        <Kpi label="Avg Delay Risk" value={avg + '%'} accent="saffron" />
        <Kpi label="High-Risk Projects" value={projects.filter((p) => p.level === 'High').length} accent="red" />
        <Kpi label="On Track" value={projects.filter((p) => p.level === 'Low').length} accent="green" />
      </div>

      <div className="mt-4">
        <ChartCard title="Infrastructure Delay Prediction — Top 8 At-Risk" height={340}>
          <Bars data={topRisk} x="project" bars={[{ key: 'delayRisk', name: 'Delay Risk %', color: '#0ea5e9' }]} vertical />
        </ChartCard>
      </div>
      <div className="mt-4">
        <DataTable title="Project Delay Risk Register" rows={projects} searchKeys={['project', 'district']}
          columns={[
            { key: 'project', label: 'Project' },
            { key: 'division', label: 'Division' },
            { key: 'delayRisk', label: 'Delay Risk', render: (v) => v + '%' },
            { key: 'status', label: 'Status' },
            { key: 'level', label: 'Risk', render: (v) => <Badge level={v}>{v}</Badge> },
          ]} />
      </div>
    </div>
  );
}
