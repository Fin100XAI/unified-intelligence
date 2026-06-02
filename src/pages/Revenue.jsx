// ============================================================================
// Revenue & Fiscal Intelligence — Maharashtra Budget 2026-27 & Economic Survey
// Data grounded in official Maharashtra Budget presented Feb 2025 and
// Maharashtra Economic Survey 2025-26. Figures have small indicative drift.
// ============================================================================
import { TrendingUp, IndianRupee, BarChart3, BookOpen, AlertTriangle, Brain, Landmark, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApi, inrCr } from '../api.js';
import { useFilters } from '../context/FilterContext.jsx';
import { PageHeader, Kpi, Card, Badge, SkeletonGrid, ErrorState, DataTable } from '../components/ui.jsx';
import { ChartCard, Bars, Lines } from '../components/charts.jsx';

// ── Helpers ──────────────────────────────────────────────────────────────────
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function ProgressBar({ value, color = 'bg-blue-500', height = 'h-2.5' }) {
  return (
    <div className={`w-full ${height} rounded-full bg-slate-100 overflow-hidden`}>
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: Math.min(100, value) + '%' }} />
    </div>
  );
}

function StatPill({ label, value, good }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`text-xs font-extrabold ${good ? 'text-emerald-600' : 'text-red-600'}`}>{value}</p>
    </div>
  );
}

// ── Economic Survey Highlights ────────────────────────────────────────────────
function EconomicSurveyPanel({ es }) {
  const metrics = [
    { label: 'GSDP 2025-26',           value: `₹${(es.gsdpCr / 100000).toFixed(2)} L Cr`,  sub: 'Advance Estimate',   good: true  },
    { label: 'Real GSDP Growth',        value: es.gsdpGrowthPct + '%',                        sub: '2025-26',           good: true  },
    { label: 'Per Capita Income',       value: `₹${es.perCapitaIncomeLakh} Lakh`,             sub: 'GSDP based',        good: true  },
    { label: 'Share in India GDP',      value: es.nationalGdpSharePct + '%',                   sub: 'Highest state',     good: true  },
    { label: 'Agriculture Growth',      value: es.agriGrowthPct + '%',                         sub: 'Real GVA 2025-26',  good: true  },
    { label: 'Industry Growth',         value: es.industryGrowthPct + '%',                     sub: 'Real GVA 2025-26',  good: true  },
    { label: 'Services Growth',         value: es.servicesGrowthPct + '%',                     sub: 'Real GVA 2025-26',  good: true  },
    { label: 'Fiscal Deficit / GSDP',   value: es.fiscalDeficitGsdpPct + '%',                  sub: 'Below 3% FRBM',    good: true  },
    { label: 'State Debt / GSDP',       value: es.stateDebtGsdpPct + '%',                      sub: 'FY 2026-27 est.',   good: true  },
    { label: 'CPI Inflation',           value: es.cpiInflationPct + '%',                        sub: 'State average',     good: true  },
    { label: 'Unemployment Rate',       value: es.unemploymentPct + '%',                        sub: 'PLFS 2023-24',      good: true  },
    { label: 'Maharashtra Exports',     value: `₹${(es.exportsCr / 100000).toFixed(1)} L Cr`, sub: '~33% of India',     good: true  },
  ];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-lg bg-blue-50 p-2"><BookOpen size={16} className="text-blue-600" /></div>
        <div>
          <h3 className="text-sm font-bold">Maharashtra Economic Survey 2026-27</h3>
          <p className="text-[11px] text-slate-400">Planning Department · Government of Maharashtra · GSDP Advance Estimates</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[10px] font-semibold text-slate-400 mb-1 leading-tight">{m.label}</p>
            <p className={`text-base font-extrabold ${m.good ? 'text-slate-800' : 'text-red-600'}`}>{m.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Revenue Source Cards ───────────────────────────────────────────────────────
function RevenueSourceCard({ src }) {
  const p = pct(src.collectedCr, src.targetCr);
  const color = p >= 90 ? 'bg-emerald-500' : p >= 75 ? 'bg-blue-500' : p >= 60 ? 'bg-amber-500' : 'bg-red-400';
  const textColor = p >= 90 ? 'text-emerald-600' : p >= 75 ? 'text-blue-600' : p >= 60 ? 'text-amber-600' : 'text-red-500';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <p className="text-[11px] font-bold text-slate-500 mb-1 leading-tight">{src.source}</p>
      <div className="flex items-end justify-between gap-2 mb-2">
        <div>
          <p className="text-base font-extrabold text-slate-800">{inrCr(src.collectedCr)}</p>
          <p className="text-[10px] text-slate-400">of {inrCr(src.targetCr)} target</p>
        </div>
        <p className={`text-lg font-extrabold ${textColor}`}>{p}%</p>
      </div>
      <ProgressBar value={p} color={color} />
    </div>
  );
}

// ── Scheme Disbursement Row ────────────────────────────────────────────────────
function SchemeRow({ s }) {
  const p = pct(s.disbursedCr, s.allocatedCr);
  const color = p >= 85 ? 'bg-emerald-500' : p >= 70 ? 'bg-blue-500' : p >= 55 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-semibold text-slate-700 truncate">{s.scheme}</p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400">{inrCr(s.disbursedCr)} / {inrCr(s.allocatedCr)}</span>
            <span className={`text-[11px] font-bold ${p >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{p}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProgressBar value={p} color={color} height="h-1.5" />
          <span className="text-[10px] text-slate-400 shrink-0">{s.beneficiaries}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Revenue() {
  const { data, loading, error } = useApi('/revenue');
  const { matchRow } = useFilters();
  if (error) return <ErrorState msg={error} />;
  if (loading || !data) return (
    <><PageHeader title="Revenue & Fiscal Intelligence" icon={TrendingUp} /><SkeletonGrid count={8} /></>
  );

  const sotrPct  = pct(data.collectedCr, data.targetCr);
  const totalPct = pct(data.totalReceiptsCr, data.totalBudgetCr);
  const util     = data.byDistrictUtilization.filter(matchRow);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Revenue & Fiscal Intelligence"
        subtitle="Maharashtra Budget 2026-27 · Economic Survey 2025-26 · Projected from official Maharashtra 2025-26 base"
        icon={TrendingUp}
      />

      {/* ── Source badge ── */}
      <Card className="p-3 border-l-4 border-blue-500 bg-blue-50 border-0">
        <p className="text-xs text-blue-700">
          <b>Data Source:</b> Maharashtra State Budget 2026-27 (projected — presented Feb 2026 · Finance Department, GoM) &amp;
          Maharashtra Economic Survey 2026-27 (Planning Department · GSDP advance estimates).
          Projections based on confirmed 2025-26 base with ~11-12% nominal growth trajectory. Figures carry indicative in-year drift.
        </p>
      </Card>

      {/* ── Budget Overview KPIs ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4 bg-blue-50 border-blue-100">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-500 mb-1">Total Budget 2026-27</p>
          <p className="text-2xl font-extrabold text-blue-700">{inrCr(data.totalBudgetCr)}</p>
          <p className="text-[11px] text-blue-400 mt-1">Projected — Largest state budget in India</p>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-100">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600 mb-1">SOTR Collected (YTD)</p>
          <p className="text-2xl font-extrabold text-emerald-700">{inrCr(data.collectedCr)}</p>
          <p className="text-[11px] text-emerald-500 mt-1">{sotrPct}% of ₹3,86,000 Cr target</p>
          <ProgressBar value={sotrPct} color="bg-emerald-500" height="h-1.5" />
        </Card>
        <Card className="p-4 bg-violet-50 border-violet-100">
          <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600 mb-1">Central Transfers</p>
          <p className="text-2xl font-extrabold text-violet-700">{inrCr(data.centralTransfersCr)}</p>
          <p className="text-[11px] text-violet-400 mt-1">Devolution + Grants</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-100">
          <p className="text-[11px] font-bold uppercase tracking-wide text-red-500 mb-1">Fiscal Deficit</p>
          <p className="text-2xl font-extrabold text-red-600">{inrCr(data.fiscalDeficitCr)}</p>
          <p className="text-[11px] text-red-400 mt-1">{data.fiscalDeficitGsdpPct}% of GSDP · FRBM compliant</p>
        </Card>
      </div>

      {/* ── Fiscal Health Strip ── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Landmark size={15} className="text-slate-500" />
          <h3 className="text-sm font-bold">Fiscal Health — FY 2026-27</h3>
          <span className="ml-auto text-[11px] text-slate-400">Maharashtra Budget 2026-27 · Economic Survey 2025-26</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="Revenue Receipts"        value={inrCr(data.totalReceiptsCr)}                          good={true}  />
          <StatPill label="Fiscal Deficit / GSDP"   value={data.fiscalDeficitGsdpPct + '%'}                      good={true}  />
          <StatPill label="State Debt / GSDP"        value={data.economicSurvey.stateDebtGsdpPct + '%'}           good={true}  />
          <StatPill label="Interest Payment"         value={inrCr(data.economicSurvey.interestPaymentCr)}          good={false} />
          <StatPill label="Grant Utilization"        value={data.grantUtilizationPct.toFixed(0) + '%'}             good={data.grantUtilizationPct >= 75} />
          <StatPill label="Procurement Efficiency"   value={data.procurementEfficiencyPct.toFixed(0) + '%'}        good={data.procurementEfficiencyPct >= 75} />
          <StatPill label="Salary Burn"              value={data.salaryBurnPct.toFixed(0) + '% of revenue'}        good={data.salaryBurnPct < 45} />
          <StatPill label="Revenue Deficit"          value={inrCr(data.economicSurvey.revenueDeficitCr)}           good={false} />
        </div>
      </Card>

      {/* ── Economic Survey ── */}
      <EconomicSurveyPanel es={data.economicSurvey} />

      {/* ── Revenue by Source ── */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-blue-50 p-2"><IndianRupee size={16} className="text-blue-600" /></div>
          <div>
            <h3 className="text-sm font-bold">Revenue Collection by Source — FY 2026-27</h3>
            <p className="text-[11px] text-slate-400">State's Own Tax Revenue target: ₹3,86,000 Cr · Budget 2026-27</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {data.revenueBySource.map(s => <RevenueSourceCard key={s.source} src={s} />)}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.centralTransfers.map(t => (
            <div key={t.source} className="flex items-center justify-between rounded-xl border border-slate-200 bg-violet-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-700">{t.source}</p>
              <p className="text-sm font-extrabold text-violet-700">{inrCr(t.amountCr)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-700">Non-Tax Revenue</p>
            <p className="text-sm font-extrabold text-slate-700">{inrCr(data.nonTaxRevenueCr)}</p>
          </div>
        </div>
      </Card>

      {/* ── Monthly GST + Stamp Duty Trend ── */}
      <ChartCard
        title="Monthly Revenue Trend — SGST vs Stamp Duty FY 2026-27 (₹ Cr)"
        subtitle="FY 2026-27 · Projected from Maharashtra 2025-26 seasonal base (+12% nominal growth)"
        height={280}
      >
        <Lines
          data={data.monthlyRevenue}
          x="month"
          lines={[
            { key: 'gstCr',   name: 'SGST (₹ Cr)',        color: '#4285F4' },
            { key: 'stampCr', name: 'Stamp Duty (₹ Cr)',   color: '#FBBC05' },
          ]}
        />
      </ChartCard>

      {/* ── Department Allocations ── */}
      <ChartCard
        title="Department-wise Budget — Allocated vs Spent (₹ Cr)"
        subtitle="Budget 2026-27 projected allocations · in-year expenditure (Apr–Jun 2026)"
        height={380}
      >
        <Bars
          data={data.departmentAllocations}
          x="department"
          bars={[
            { key: 'allocatedCr', name: 'Allocated (₹ Cr)', color: '#4285F4' },
            { key: 'spentCr',     name: 'Spent (₹ Cr)',     color: '#FBBC05' },
          ]}
          vertical
        />
      </ChartCard>

      {/* ── Scheme Disbursements + Anomaly Flags ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Scheme spending */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-lg bg-emerald-50 p-2"><PieChart size={15} className="text-emerald-600" /></div>
            <div>
              <h3 className="text-sm font-bold">Flagship Scheme Disbursements</h3>
              <p className="text-[11px] text-slate-400">Budget 2026-27 · Projected allocation vs Q1 disbursement</p>
            </div>
          </div>
          <div>
            {data.schemeAllocations.map(s => <SchemeRow key={s.scheme} s={s} />)}
          </div>
        </Card>

        {/* AI Anomaly Flags */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-lg bg-red-50 p-2"><Brain size={15} className="text-red-500" /></div>
            <div>
              <h3 className="text-sm font-bold">AI Budget Anomaly Flags</h3>
              <p className="text-[11px] text-slate-400">AI-detected · Human review required before action</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.anomalyFlags.map(a => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400">{a.id}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">{a.detectedAt}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{a.type}</p>
                  <p className="text-[11px] text-slate-400">{a.department}</p>
                </div>
                <Badge level={a.severity}>{a.severity}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-violet-50 border border-violet-100 p-2.5 flex items-center gap-2">
            <Brain size={12} className="text-violet-500 shrink-0" />
            <p className="text-[11px] text-violet-700">All flags are AI-generated · Explainable AI · Officer approval required</p>
          </div>
        </Card>
      </div>

      {/* ── District Fund Utilization ── */}
      <DataTable
        title="District-wise Fund Utilization — FY 2026-27"
        rows={util}
        searchKeys={['district']}
        columns={[
          { key: 'district',      label: 'District' },
          { key: 'utilizationPct', label: 'Utilization',
            render: (v) => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: v + '%' }} />
                </div>
                <Badge level={v >= 80 ? 'Low' : v >= 60 ? 'Medium' : 'High'}>{v}%</Badge>
              </div>
            )
          },
        ]}
      />
    </div>
  );
}
