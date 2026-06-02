import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, Activity, Zap, TrendingUp } from 'lucide-react';
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
  const healthyDepts = data.deptPosture.filter(d => d.postureScore >= 80).length;

  return (
    <div className="space-y-5">
      <PageHeader title="Cyber Governance & AI Trust Layer" subtitle="🔒 CERT-In alignment · DPDP-compliant · Explainable, human-in-the-loop AI" icon={ShieldCheck} />
      
      {/* Top KPI Row - Key Security Metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col items-center justify-center p-6">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-3">Security Posture</p>
          <ScoreGauge score={data.cyberReadinessScore} label="Readiness" color="#0284c7" />
          <p className="text-xs text-slate-500 mt-3">{healthyDepts}/{data.deptPosture.length} Departments Secure</p>
        </Card>
        
        <Kpi label="CERT-In Alignment" value={data.certInAlignmentPct.toFixed(0) + '%'} icon={CheckCircle2} accent="green" />
        <Kpi label="Data Protection (DPDP)" value={data.dataProtectionPct.toFixed(0) + '%'} accent="navy" />
        <Kpi label="AI Explainability" value={data.explainabilityScore.toFixed(0) + '%'} icon={Zap} accent="gold" />
        <Kpi label="Encryption Coverage" value={data.encryptionCoverage} accent="saffron" />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Kpi label="Systems Secured" value={data.systemsSecured} icon={Lock} accent="skyblue" />
        <Kpi label="Threats Detected" value={data.threatsDetected} icon={AlertTriangle} accent="red" />
        <Kpi label="Response Time" value={data.incidentResponseTime} accent="navy" />
        <Kpi label="Training Completion" value={data.securityTrainingCompletion} accent="green" />
      </div>

      {/* Department Security Posture Chart */}
      <div className="mt-4">
        <ChartCard title="Department Security Posture" subtitle="Posture score vs vulnerabilities" height={340}>
          <Bars data={posture} x="department" bars={[
            { key: 'postureScore', name: 'Security Score', color: '#0284c7' },
            { key: 'openVulns', name: 'Open Vulns', color: '#ef4444' },
          ]} vertical />
        </ChartCard>
      </div>

      {/* Compliance & Data Tables */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold flex items-center gap-2">
            <Shield size={16} className="text-blue-600" /> Department Compliance Status
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.deptPosture.slice(0, 8).map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-2 rounded-lg bg-gradient-light">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{dept.department}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-blue" style={{width: `${dept.postureScore}%`}} />
                    </div>
                    <span className="text-xs font-bold text-blue-600">{dept.postureScore}%</span>
                  </div>
                </div>
                <Badge level={dept.complianceStatus === 'Compliant' ? 'Low' : 'High'} className="ml-2">
                  {dept.complianceStatus}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold flex items-center gap-2">
            <Activity size={16} className="text-orange-600" /> Recent Vulnerabilities
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.vulnerabilityAlerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className="p-2 rounded-lg bg-gradient-light border border-orange-200/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{alert.id}</p>
                    <p className="text-xs text-slate-600">{alert.department}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge level={alert.severity}>{alert.severity}</Badge>
                    <span className="text-xs text-slate-500">{alert.discoveryDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Access Logs & Security Incidents */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold flex items-center gap-2">
            <Lock size={16} className="text-blue-600" /> Access Control Logs
          </h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {data.accessLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 rounded text-xs border border-blue-100">
                <div className="flex-1">
                  <span className="font-semibold text-slate-700">{log.role}</span>
                  <span className="text-slate-500"> · {log.action}</span>
                </div>
                <span className={`text-xs font-semibold ${log.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" /> Recent Security Incidents
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.securityIncidents.slice(0, 6).map((incident) => (
              <div key={incident.id} className="p-2 rounded-lg bg-red-50 border border-red-200/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700">{incident.type}</p>
                    <p className="text-xs text-slate-600">{incident.date}</p>
                  </div>
                  <Badge level={incident.severity}>{incident.resolution}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Add missing icon
const Shield = ShieldCheck;
