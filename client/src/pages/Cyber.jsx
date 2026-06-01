import { ShieldCheck, Brain, CheckCircle2 } from 'lucide-react';
import { useApi } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, ScoreGauge, SkeletonGrid, ErrorState, DataTable } from '../components/ui.jsx';
import { ChartCard, Bars } from '../components/charts.jsx';

export default function Cyber() {
  const { data, loading, error } = useApi('/cyber');
  const { filters } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return <><PageHeader title="Cyber Governance & AI Trust Layer" icon={ShieldCheck} /><SkeletonGrid count={4} /></>;

  const posture = data.deptPosture.filter((r) => !filters.department || r.department === filters.department);

  return (
    <div>
      <PageHeader title="Cyber Governance & AI Trust Layer" subtitle="CERT-In alignment · DPDP · explainable, human-in-the-loop AI" icon={ShieldCheck} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-5 lg:col-span-1">
          <p className="text-xs font-semibold uppercase text-slate-400">Cyber Readiness</p>
          <ScoreGauge score={data.cyberReadinessScore} label="Readiness" />
        </Card>
        <div className="grid grid-cols-2 gap-4 lg:col-span-3">
          <Kpi label="CERT-In Alignment" value={data.certInAlignmentPct + '%'} icon={CheckCircle2} accent="green" />
          <Kpi label="Data Protection (DPDP)" value={data.dataProtectionPct + '%'} accent="navy" />
          <Kpi label="AI Explainability Score" value={data.explainabilityScore + '%'} icon={Brain} accent="gold" />
          <Kpi label="Human-in-Loop Approvals" value={data.humanInLoopApprovalPct + '%'} accent="saffron" />
          <Kpi label="AI Model Audit" value={data.aiModelAuditStatus} accent={data.aiModelAuditStatus === 'Passed' ? 'green' : 'red'} />
          <Kpi label="Open Vulnerabilities" value={data.deptPosture.reduce((s, d) => s + d.openVulns, 0)} accent="red" />
        </div>
      </div>

      <div className="mt-4">
        <ChartCard title="Department Security Posture" subtitle="Posture score vs open vulnerabilities" height={340}>
          <Bars data={posture} x="department" bars={[
            { key: 'postureScore', name: 'Posture', color: '#10b981' },
            { key: 'openVulns', name: 'Open Vulns', color: '#ef4444' },
          ]} vertical />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DataTable title="Vulnerability Alerts" rows={data.vulnerabilityAlerts} searchKeys={['id', 'department']}
          columns={[
            { key: 'id', label: 'CVE' },
            { key: 'department', label: 'Department' },
            { key: 'severity', label: 'Severity', render: (v) => <Badge level={v}>{v}</Badge> },
            { key: 'status', label: 'Status' },
          ]} />
        <DataTable title="Role-Based Access Logs" rows={data.accessLogs} searchKeys={['role', 'action']}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'role', label: 'Role' },
            { key: 'action', label: 'Action' },
            { key: 'time', label: 'When' },
          ]} />
      </div>
    </div>
  );
}
