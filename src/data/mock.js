// ============================================================================
// CM Governance Intelligence War Room — in-app data layer (no backend).
// Figures are indicative: grounded in public Maharashtra statistics with small
// per-minute drift so the dashboard feels live. NOT official government data.
// ============================================================================

let _seed = 42;
const reseed = (s) => { _seed = ((Math.floor(s) % 233280) + 233280) % 233280 || 1; };
const rnd = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
const r = (min, max) => Math.round(min + rnd() * (max - min));
const rf = (min, max, d = 1) => +(min + rnd() * (max - min)).toFixed(d);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

export const DIVISIONS = ['Konkan', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Nagpur'];

export const DISTRICTS = {
  Konkan: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg'],
  Pune: ['Pune', 'Satara', 'Sangli', 'Solapur', 'Kolhapur'],
  Nashik: ['Nashik', 'Dhule', 'Nandurbar', 'Jalgaon', 'Ahmednagar'],
  Aurangabad: ['Chhatrapati Sambhajinagar', 'Jalna', 'Beed', 'Latur', 'Dharashiv', 'Nanded', 'Parbhani', 'Hingoli'],
  Amravati: ['Amravati', 'Akola', 'Washim', 'Buldhana', 'Yavatmal'],
  Nagpur: ['Nagpur', 'Wardha', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli'],
};

export const DEPARTMENTS = [
  'Revenue', 'Home', 'Finance', 'Social Justice', 'Tribal Welfare', 'Health',
  'Education', 'Urban Development', 'Rural Development', 'Agriculture',
  'Women & Child Development', 'Disaster Management', 'IT / MahaIT',
];

export const SCHEMES = [
  'Ladki Bahin Yojana', 'PM Kisan Samman Nidhi', 'Sanjay Gandhi Niradhar',
  'Shravan Bal Seva Nivrutti', 'MahaDBT Scholarship', 'Gharkul Awas Yojana',
  'Mahatma Phule Jan Arogya', 'Annasaheb Patil Loan Scheme', 'Namo Shetkari Mahasanman',
];

export const RTS_SERVICES = [
  'Income Certificate', 'Caste Certificate', 'Domicile Certificate',
  '7/12 Extract', 'Birth Certificate', 'Death Certificate',
  'Senior Citizen Certificate', 'Non-Creamy Layer Certificate', 'EWS Certificate',
];

const SCHEME_ANCHORS = {
  'Ladki Bahin Yojana':          { elig: 24000000, outlayCr: 46000 },
  'PM Kisan Samman Nidhi':       { elig: 9200000,  outlayCr: 11000 },
  'Sanjay Gandhi Niradhar':      { elig: 3500000,  outlayCr: 6800 },
  'Shravan Bal Seva Nivrutti':   { elig: 3000000,  outlayCr: 5400 },
  'MahaDBT Scholarship':         { elig: 3500000,  outlayCr: 4200 },
  'Gharkul Awas Yojana':         { elig: 1600000,  outlayCr: 9500 },
  'Mahatma Phule Jan Arogya':    { elig: 12000000, outlayCr: 3200 },
  'Annasaheb Patil Loan Scheme': { elig: 180000,   outlayCr: 2100 },
  'Namo Shetkari Mahasanman':    { elig: 9200000,  outlayCr: 10800 },
};

const drift = (base, pct = 0.02) => Math.round(base * (1 + (rnd() - 0.5) * pct));
const RISK = ['Critical', 'High', 'Medium', 'Low'];
const flatDistricts = () => DIVISIONS.flatMap((d) => DISTRICTS[d].map((n) => ({ name: n, division: d })));
const riskFromScore = (s) => (s >= 80 ? 'Low' : s >= 65 ? 'Medium' : s >= 50 ? 'High' : 'Critical');
const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const buildDistricts = () =>
  flatDistricts().map(({ name, division }) => {
    const gov = r(46, 94);
    return {
      district: name, division, governanceScore: gov,
      welfareScore: r(45, 95), rtsBacklog: r(120, 4200), revenueRiskPct: rf(2, 28),
      disasterVulnerability: r(20, 90), lawOrderLevel: pick(RISK), infraDelayRisk: r(10, 80),
      collectorAction: pick(['On Track', 'Action Needed', 'Escalated', 'Under Review']),
      riskLevel: riskFromScore(gov),
      urbanRural: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane'].includes(name) ? 'Urban' : 'Rural',
    };
  });

const buildDepartments = () =>
  DEPARTMENTS.map((name) => {
    const health = r(48, 93);
    return {
      department: name, healthScore: health, pendingApprovals: r(80, 5200), slaBreaches: r(20, 1400),
      budgetUtilizationPct: rf(38, 99), grievanceLoad: r(150, 8000),
      riskScore: 100 - health, riskLevel: riskFromScore(health),
      trend: months.map((m) => ({ month: m, score: r(45, 95) })),
    };
  });

const buildOverview = (districts, departments) => {
  const escalations = districts.map((d) => ({
    id: 'ESC-' + r(1000, 9999),
    title: pick(['RTS SLA breach surge', 'DBT disbursement stall', 'Flood readiness gap',
      'Revenue shortfall alert', 'Grievance backlog spike', 'Infra milestone slip']),
    district: d.district, department: pick(DEPARTMENTS), priority: pick(['Critical', 'High', 'Medium']), ageDays: r(1, 21),
  })).sort(() => rnd() - 0.5).slice(0, 5);

  const sortedDistricts = [...districts].sort((a, b) => b.governanceScore - a.governanceScore);

  // 6 CM-GIW Governance Indices
  const stateHealthIndex = r(74, 86);
  const deptPerformanceIndex = r(70, 88);
  const districtPerformanceIndex = r(66, 84);
  const welfareCoverageIndex = r(68, 86);
  const citizenServiceIndex = r(72, 89);
  const developmentProgressIndex = r(70, 85);

  // Governance Risk Radar — early warning signals
  const riskRadar = [
    {
      id: 'RR-001',
      signal: 'Welfare Delivery Deterioration',
      detail: `${r(3, 8)} districts showing coverage decline >5% in last 30 days`,
      severity: pick(['Critical', 'High']),
      affectedDistricts: r(3, 8),
      department: 'Women & Child Development',
      trend: 'worsening',
    },
    {
      id: 'RR-002',
      signal: 'RTS SLA Breach Escalation',
      detail: `Certificate backlog in ${pick(['Revenue', 'Social Justice', 'Education'])} dept at ${r(2,4)}x division average`,
      severity: pick(['High', 'Medium']),
      affectedDistricts: r(4, 10),
      department: 'Revenue',
      trend: 'worsening',
    },
    {
      id: 'RR-003',
      signal: 'Infrastructure Project Delay Risk',
      detail: `${r(12, 28)} projects at risk of missing Q3 milestone; ${r(3,7)} in critical path`,
      severity: 'High',
      affectedDistricts: r(5, 12),
      department: 'Urban Development',
      trend: 'stable',
    },
    {
      id: 'RR-004',
      signal: 'Budget Under-Utilisation Alert',
      detail: `${pick(DEPARTMENTS)} dept at ${r(38, 52)}% utilization with 45 days remaining in quarter`,
      severity: 'Medium',
      affectedDistricts: r(2, 6),
      department: 'Finance',
      trend: 'improving',
    },
    {
      id: 'RR-005',
      signal: 'Grievance Spike Detected',
      detail: `${r(18, 35)}% inflow surge in ${pick(DISTRICTS.Aurangabad)} · ${pick(DISTRICTS.Amravati)} cluster`,
      severity: pick(['Critical', 'High']),
      affectedDistricts: r(3, 7),
      department: pick(DEPARTMENTS),
      trend: 'worsening',
    },
    {
      id: 'RR-006',
      signal: 'Monsoon Preparedness Gap',
      detail: `${r(4, 9)} coastal/flood-prone districts below readiness threshold`,
      severity: pick(['High', 'Medium']),
      affectedDistricts: r(4, 9),
      department: 'Disaster Management',
      trend: 'stable',
    },
  ];

  // Intervention zones
  const interventionZones = [
    {
      district: pick([...DISTRICTS.Aurangabad, ...DISTRICTS.Amravati]),
      type: 'Welfare Saturation',
      action: 'Enrollment drive needed',
      impact: 'High',
    },
    {
      district: pick([...DISTRICTS.Nashik, ...DISTRICTS.Konkan]),
      type: 'RTS Backlog Clearance',
      action: 'Additional officers required',
      impact: 'High',
    },
    {
      district: pick(DISTRICTS.Nagpur),
      type: 'Infrastructure Acceleration',
      action: 'CM review scheduled',
      impact: 'Medium',
    },
    {
      district: pick(DISTRICTS.Pune),
      type: 'Revenue Recovery',
      action: 'Task force deployed',
      impact: 'High',
    },
  ];

  return {
    governanceHealthScore: stateHealthIndex,
    // 6 CM-GIW Indices
    stateHealthIndex,
    departmentPerformanceIndex: deptPerformanceIndex,
    districtPerformanceIndex,
    welfareCoverageIndex,
    citizenServiceIndex,
    developmentProgressIndex,
    // existing KPIs
    departmentsMonitored: departments.length,
    districtsMonitored: districts.length,
    criticalAlerts: r(18, 45),
    rtsPending: r(180000, 240000),
    welfareGapPct: rf(8, 18),
    disasterRiskDistricts: districts.filter((d) => d.disasterVulnerability > 65).length,
    revenueCollectionCr: drift(395000, 0.04),
    revenueTargetCr: 490000,
    topEscalations: escalations,
    totalBeneficiariesServed: r(42000000, 48000000),
    serviceDeliveryScore: rf(78, 92),
    grievancesResolved: r(850000, 950000),
    avgResolutionDays: rf(3.2, 6.8, 1),
    infrastructureProjects: r(285, 320),
    projectCompletionRate: rf(72, 88),
    citizenSatisfaction: rf(76, 88),
    onlineServiceUsage: rf(62, 78),
    deptRanking: departments.map((d) => ({ department: d.department, healthScore: d.healthScore }))
      .sort((a, b) => b.healthScore - a.healthScore),
    healthTrend: months.map((m) => ({ month: m, score: r(72, 85) })),
    riskRadar,
    interventionZones,
    topDistricts: sortedDistricts.slice(0, 5).map(d => ({ district: d.district, score: d.governanceScore, division: d.division })),
    atRiskDistricts: sortedDistricts.slice(-5).map(d => ({ district: d.district, score: d.governanceScore, division: d.division, riskLevel: d.riskLevel })),
  };
};

const buildWelfare = () => {
  const schemes = SCHEMES.map((s) => {
    const a = SCHEME_ANCHORS[s] || { elig: 1000000 };
    const eligible = drift(a.elig);
    const approved = Math.round(eligible * rf(0.8, 0.96, 3));
    return { scheme: s, eligible, approved, gapPct: +((1 - approved / eligible) * 100).toFixed(1) };
  });
  const eligible = schemes.reduce((t, x) => t + x.eligible, 0);
  const approved = schemes.reduce((t, x) => t + x.approved, 0);
  const applicants = Math.round(eligible * rf(0.84, 0.9, 3));
  const recipients = Math.round(approved * rf(0.9, 0.97, 3));
  return {
    summary: { eligible, applicants, approved, recipients },
    dropOffRatePct: +((1 - recipients / eligible) * 100).toFixed(1),
    inclusionGapPct: +((1 - approved / eligible) * 100).toFixed(1),
    dbtDelayRiskPct: rf(6, 14), schemes,
    byDistrict: flatDistricts().map(({ name, division }) => ({ district: name, division, welfareGapPct: rf(4, 28) })),
  };
};

const buildRTS = () => ({
  total: 2840000, pending: r(190000, 240000), slaBreached: r(34000, 62000), avgDisposalDays: rf(3, 14),
  byDepartment: DEPARTMENTS.map((d) => ({ department: d, backlog: r(2000, 42000), breached: r(200, 8000) })),
  byDistrict: flatDistricts().map(({ name }) => ({ district: name, performance: r(55, 96), backlog: r(500, 9000) })),
  escalationQueue: Array.from({ length: 8 }, () => ({
    id: 'RTS-' + r(10000, 99999), service: pick(RTS_SERVICES), district: pick(flatDistricts()).name,
    daysOverSLA: r(1, 30), priority: pick(RISK),
  })),
  highRiskServices: RTS_SERVICES.map((s) => ({ service: s, breachRiskPct: rf(8, 45) }))
    .sort((a, b) => b.breachRiskPct - a.breachRiskPct).slice(0, 5),
});

const buildMahaDBT = () => {
  const bySchemeFlow = SCHEMES.map((s) => {
    const a = SCHEME_ANCHORS[s] || { outlayCr: 1500 };
    const disbursedCr = drift(Math.round(a.outlayCr * rf(0.6, 0.85, 3)), 0.05);
    return { scheme: s, disbursedCr, pendingCr: Math.round(disbursedCr * rf(0.02, 0.12, 3)) };
  });
  return {
    totalDisbursedCr: bySchemeFlow.reduce((t, x) => t + x.disbursedCr, 0),
    pendingDisbursedCr: bySchemeFlow.reduce((t, x) => t + x.pendingCr, 0),
    failedTxns: r(42000, 98000), bankLinkingIssues: r(120000, 280000),
    duplicateRiskFlags: r(3000, 12000), verifiedPct: rf(88, 96), bySchemeFlow,
    byDistrictGap: flatDistricts().map(({ name }) => ({ district: name, gapPct: rf(2, 18) })),
  };
};

// ---- Maharashtra Budget 2026-27 & Economic Survey 2025-26 -------------------
// Budget 2026-27 projected based on Maharashtra's historical ~11-12% nominal
// growth trajectory applied to confirmed 2025-26 base figures.
// Economic Survey 2025-26 based on GSDP advance estimates.
// NOTE: AI knowledge cutoff Aug 2025; 2026-27 figures are forward projections.
const buildRevenue = () => {
  // ── Revenue Sources — Maharashtra Budget 2026-27 (projected, ₹ Cr) ──
  const revenueBySource = [
    { source: "SGST (State's Share)",     targetCr: 238000, collectedCr: drift(163200, 0.025), yoyGrowthPct: 13.3 },
    { source: 'Stamp Duty & Registration', targetCr: 66000,  collectedCr: drift(47800,  0.030), yoyGrowthPct: 13.8 },
    { source: 'State Excise',              targetCr: 36500,  collectedCr: drift(25400,  0.025), yoyGrowthPct: 14.1 },
    { source: 'Motor Vehicle Tax',         targetCr: 17500,  collectedCr: drift(12200,  0.030), yoyGrowthPct: 16.7 },
    { source: 'Electricity Duty',          targetCr: 9500,   collectedCr: drift(6600,   0.020), yoyGrowthPct: 11.8 },
    { source: 'Professional Tax',          targetCr: 4000,   collectedCr: drift(2800,   0.020), yoyGrowthPct: 14.3 },
    { source: 'Other State Taxes',         targetCr: 14500,  collectedCr: drift(8200,   0.035), yoyGrowthPct: 31.8 },
  ];

  // ── Central Transfers ──
  const centralTransfers = [
    { source: 'Tax Devolution (16th FC)',  amountCr: drift(121000, 0.01) },
    { source: 'Central Grants-in-Aid',    amountCr: drift(58000,  0.02)  },
  ];

  const nonTaxRevenueCr = drift(40000, 0.03);

  const sotrCollected  = revenueBySource.reduce((s, x) => s + x.collectedCr, 0);
  const centralTotal   = centralTransfers.reduce((s, x) => s + x.amountCr, 0);
  const totalCollected = sotrCollected + centralTotal + nonTaxRevenueCr;

  // ── Department Allocations — Budget 2026-27 (₹ Cr) ──
  const departmentAllocations = [
    { department: 'Women & Child Dev.',  allocatedCr: 56000, spentCr: drift(33800, 0.04) },
    { department: 'Rural Development',   allocatedCr: 54000, spentCr: drift(31200, 0.04) },
    { department: 'Finance / Debt Svc',  allocatedCr: 46000, spentCr: drift(28800, 0.02) },
    { department: 'Education',           allocatedCr: 42000, spentCr: drift(24600, 0.03) },
    { department: 'Public Works',        allocatedCr: 34000, spentCr: drift(19200, 0.05) },
    { department: 'Agriculture',         allocatedCr: 30000, spentCr: drift(17400, 0.04) },
    { department: 'Urban Development',   allocatedCr: 26000, spentCr: drift(14800, 0.04) },
    { department: 'Health',              allocatedCr: 26000, spentCr: drift(15200, 0.03) },
    { department: 'Water Resources',     allocatedCr: 21000, spentCr: drift(11800, 0.05) },
    { department: 'Social Justice',      allocatedCr: 18500, spentCr: drift(10600, 0.04) },
    { department: 'Home',                allocatedCr: 18000, spentCr: drift(11000, 0.02) },
    { department: 'Tribal Welfare',      allocatedCr: 16000, spentCr: drift(8800,  0.05) },
    { department: 'IT / MahaIT',         allocatedCr: 3500,  spentCr: drift(1900,  0.04) },
  ];

  // ── Flagship Scheme Allocations — Budget 2026-27 ──
  const schemeAllocations = [
    { scheme: 'Ladki Bahin Yojana',           allocatedCr: 52000, disbursedCr: drift(30400, 0.03), beneficiaries: '2.42 Cr women'      },
    { scheme: 'Namo Shetkari Mahasanman',      allocatedCr: 12000, disbursedCr: drift(7000,  0.03), beneficiaries: '90 Lakh farmers'    },
    { scheme: 'PM Awas Yojana (Urban+Rural)',  allocatedCr: 14500, disbursedCr: drift(8200,  0.04), beneficiaries: '7.4 Lakh HH'        },
    { scheme: 'Sanjay Gandhi Niradhar',        allocatedCr: 7800,  disbursedCr: drift(4600,  0.02), beneficiaries: '38 Lakh pensioners' },
    { scheme: 'Jal Jeevan Mission',            allocatedCr: 9000,  disbursedCr: drift(5000,  0.05), beneficiaries: '22 Lakh HH'         },
    { scheme: 'Mahatma Phule Jan Arogya',      allocatedCr: 4200,  disbursedCr: drift(2400,  0.03), beneficiaries: '2.0 Cr HH'          },
    { scheme: 'Mukhyamantri Teerth Darshan',   allocatedCr: 800,   disbursedCr: drift(460,   0.04), beneficiaries: '4.8 Lakh seniors'   },
  ];

  // ── Monthly Revenue Trend 2026-27 (~12% higher than 2025-26 seasonal pattern) ──
  const monthlyRevenue = [
    { month: 'Apr', gstCr: 15900 + r(-450,450), stampCr: 4300 + r(-180,180) },
    { month: 'May', gstCr: 17700 + r(-450,450), stampCr: 4100 + r(-180,180) },
    { month: 'Jun', gstCr: 16400 + r(-450,450), stampCr: 4700 + r(-180,180) },
    { month: 'Jul', gstCr: 19300 + r(-450,450), stampCr: 5200 + r(-180,180) },
    { month: 'Aug', gstCr: 18400 + r(-450,450), stampCr: 4900 + r(-180,180) },
    { month: 'Sep', gstCr: 20400 + r(-450,450), stampCr: 5400 + r(-180,180) },
    { month: 'Oct', gstCr: 17700 + r(-450,450), stampCr: 4500 + r(-180,180) },
    { month: 'Nov', gstCr: 19700 + r(-450,450), stampCr: 4900 + r(-180,180) },
    { month: 'Dec', gstCr: 21500 + r(-450,450), stampCr: 5800 + r(-180,180) },
    { month: 'Jan', gstCr: 21100 + r(-450,450), stampCr: 5400 + r(-180,180) },
    { month: 'Feb', gstCr: 24000 + r(-450,450), stampCr: 6300 + r(-180,180) },
    { month: 'Mar', gstCr: 27600 + r(-450,450), stampCr: 7000 + r(-180,180) },
  ];

  // ── Economic Survey 2025-26 (advance estimates basis 2026-27 projections) ──
  const economicSurvey = {
    surveyYear:              '2025-26',
    gsdpCr:                  4550000,   // ₹45.5 lakh Cr — 2025-26 advance estimate
    gsdpGrowthPct:           7.8,       // Real GSDP growth
    nominalGsdpGrowthPct:    12.7,
    perCapitaIncomeLakh:     2.82,      // ₹2.82 lakh
    nationalGdpSharePct:     14.3,
    agriGrowthPct:           5.8,
    industryGrowthPct:       8.8,
    servicesGrowthPct:       9.4,
    fiscalDeficitCr:         110000,    // 2026-27 budget estimate
    fiscalDeficitGsdpPct:    2.42,      // Below 3% FRBM ceiling
    stateDebtGsdpPct:        18.2,
    revenueDeficitCr:        58000,
    interestPaymentCr:       54000,
    exportsCr:               1580000,   // ₹15.8 lakh Cr — ~33% of India's exports
    unemploymentPct:         4.5,
    cpiInflationPct:         3.8,
    capitalExpenditureCr:    120000,    // 2026-27 capex budget
    revenueExpenditureCr:    630000,    // 2026-27 revenue expenditure
  };

  return {
    budgetYear: '2026-27',
    totalBudgetCr:          825000,    // Maharashtra Budget 2026-27 total outlay
    targetCr:               386000,    // SOTR target 2026-27
    collectedCr:            drift(sotrCollected, 0.02),
    centralTransfersCr:     centralTotal,
    nonTaxRevenueCr,
    totalReceiptsCr:        drift(totalCollected, 0.02),
    fiscalDeficitCr:        economicSurvey.fiscalDeficitCr,
    fiscalDeficitGsdpPct:   economicSurvey.fiscalDeficitGsdpPct,
    // Fiscal management metrics
    fiscalPressureScore:    r(35, 52),
    salaryBurnPct:          rf(32, 42),
    grantUtilizationPct:    rf(74, 88),
    procurementEfficiencyPct: rf(70, 86),
    // Detailed breakdowns
    revenueBySource,
    centralTransfers,
    departmentAllocations,
    schemeAllocations,
    monthlyRevenue,
    economicSurvey,
    // AI anomaly flags
    anomalyFlags: Array.from({ length: 5 }, () => ({
      id: 'FIN-' + r(1000, 9999),
      department: pick(DEPARTMENTS),
      type: pick(['Grant under-utilization', 'Procurement variance', 'Unusual spend spike', 'Duplicate vendor alert', 'Scheme leakage signal']),
      severity: pick(RISK),
      detectedAt: r(1, 72) + ' hours ago',
    })),
    byDistrictUtilization: flatDistricts().map(({ name }) => ({ district: name, utilizationPct: rf(52, 96) })),
    byDepartmentExpenditure: departmentAllocations.map(d => ({ department: d.department, allocatedCr: d.allocatedCr, spentCr: d.spentCr })),
  };
};

const buildDisaster = () => ({
  vulnerabilityIndex: r(45, 72),
  risks: { flood: r(40, 90), heatwave: r(30, 85), drought: r(25, 80), coastal: r(35, 88), urbanFlooding: r(40, 92) },
  byDistrict: flatDistricts().map(({ name, division }) => ({
    district: name, division, readinessScore: r(40, 95), floodRisk: r(20, 95), reliefResourcesPct: rf(45, 98),
  })),
  earlyWarnings: Array.from({ length: 5 }, () => ({
    id: 'DIS-' + r(1000, 9999), type: pick(['Flood', 'Heatwave', 'Cyclone', 'Heavy Rainfall', 'Landslide']),
    district: pick(flatDistricts()).name, severity: pick(['Critical', 'High', 'Medium']), issued: r(1, 48) + 'h ago',
  })),
});

const buildLawOrder = () => ({
  notice: 'Governance-safe operational intelligence only. No surveillance, no personal data. Responsible-access controlled.',
  escalationTrend: months.map((m) => ({ month: m, escalations: r(40, 180) })),
  byDistrict: flatDistricts().map(({ name }) => ({
    district: name, incidentConcentration: r(10, 100),
    responseStatus: pick(['Resolved', 'In Progress', 'Coordinating']), level: pick(RISK),
  })),
  adminAlerts: Array.from({ length: 5 }, () => ({
    id: 'LO-' + r(1000, 9999), district: pick(flatDistricts()).name,
    signal: pick(['Public safety coordination', 'Crowd management readiness', 'Inter-agency sync', 'Resource mobilization']),
    priority: pick(['High', 'Medium']),
  })),
  sensitiveDistricts: ['Gadchiroli', 'Gondia', 'Chandrapur'].map((d) => ({ district: d, accessNote: 'Responsible access required' })),
});

const buildCyber = () => ({
  cyberReadinessScore: r(72, 88), certInAlignmentPct: rf(78, 96), dataProtectionPct: rf(82, 98),
  explainabilityScore: rf(80, 94), humanInLoopApprovalPct: rf(92, 99),
  aiModelAuditStatus: pick(['Passed', 'Review Pending', 'Passed', 'Passed']),
  incidentResponseTime: rf(0.5, 3.2, 1) + ' hours',
  securityTrainingCompletion: rf(85, 99) + '%',
  encryptionCoverage: rf(96, 100) + '%',
  penetrationTestScore: rf(78, 92) + '%',
  systemsSecured: r(180, 240), threatsDetected: r(15, 85),
  deptPosture: DEPARTMENTS.map((d) => ({
    department: d, postureScore: r(65, 95), openVulns: r(0, 25),
    criticalVulns: r(0, 8), patchedThisMonth: r(5, 35),
    complianceStatus: pick(['Compliant', 'Minor Issues', 'Compliant', 'At Risk']),
  })),
  vulnerabilityAlerts: Array.from({ length: 8 }, () => ({
    id: 'CVE-' + r(2023, 2026) + '-' + r(1000, 9999),
    severity: pick(RISK), department: pick(DEPARTMENTS),
    status: pick(['Open', 'Patching', 'Mitigated', 'Monitoring']),
    discoveryDate: r(1, 45) + ' days ago', patchAvailable: pick([true, true, false, true]),
  })),
  accessLogs: Array.from({ length: 10 }, () => ({
    id: 'RBAC-' + r(1000, 9999),
    role: pick(['District Collector', 'Principal Secretary', 'MahaIT Admin', 'Divisional Commissioner', 'IT Security Officer']),
    action: pick(['Viewed dashboard', 'Exported report', 'Approved recommendation', 'Accessed audit log', 'Modified access policy']),
    time: r(1, 120) + ' min ago', status: pick(['Success', 'Success', 'Failed Attempt', 'Success']),
  })),
  securityIncidents: Array.from({ length: 4 }, () => ({
    id: 'INC-' + r(1000, 9999),
    type: pick(['Phishing attempt', 'Unauthorized access', 'Data exfiltration', 'Configuration drift']),
    date: r(1, 30) + ' days ago', resolution: pick(['Contained', 'Resolved', 'Escalated']),
    severity: pick(['High', 'Medium', 'Medium']),
  })),
});

const buildAuditLogs = () =>
  Array.from({ length: 24 }, (_, i) => ({
    id: 'AI-LOG-' + (1000 + i),
    recommendation: pick(['Prioritize RTS backlog clearance in Beed', 'Flag DBT duplicate cluster in Nanded',
      'Escalate flood readiness in Kolhapur', 'Reallocate grievance officers in Pune',
      'Review revenue shortfall in Latur', 'Trigger heatwave advisory in Chandrapur']),
    riskCategory: pick(RISK), department: pick(DEPARTMENTS), district: pick(flatDistricts()).name,
    humanReview: pick(['Approved', 'Pending', 'Rejected', 'Approved']),
    explainability: pick(['Backlog 2.3x division avg; SLA breach trend rising',
      'Transaction pattern matches duplicate heuristic (conf 0.82)',
      'Rainfall forecast + low relief stock correlation',
      'Grievance inflow exceeds disposal capacity by 34%']),
    officerAction: pick(['Acknowledged', 'Action initiated', 'Deferred', 'Escalated']),
    compliance: pick(['DPDP-compliant', 'Audit-ready', 'DPDP-compliant']),
    timestamp: new Date(Date.now() - i * 3600 * 1000 * r(1, 8)).toISOString(),
  }));

const buildAlerts = (districts) =>
  Array.from({ length: 12 }, () => {
    const d = pick(districts);
    return {
      id: 'ALERT-' + r(10000, 99999),
      title: pick(['AI Governance Risk: anomalous spend', 'SLA breach risk threshold crossed',
        'Welfare inclusion gap widening', 'Disaster readiness below threshold',
        'Cyber vulnerability disclosed', 'Fiscal pressure escalation']),
      district: d.district, department: pick(DEPARTMENTS),
      priority: pick(RISK), risk: pick(RISK), explainable: true, time: r(1, 240) + ' min ago',
    };
  });

// ---- CM Priority Tracker — 25 flagship items -----------------------------------
const buildCMPriority = () => {
  // Static templates; progress/status/signal drift each minute via r() + pick()
  const TEMPLATES = [
    { serial: 1,  title: 'Ladki Bahin Yojana — Universal State Coverage',            category: 'Promise',          department: 'Women & Child Development', targetDate: 'Mar 2026' },
    { serial: 2,  title: 'Namo Shetkari Mahasanman — All Eligible Farmers',           category: 'Promise',          department: 'Agriculture',               targetDate: 'Mar 2026' },
    { serial: 3,  title: 'Mahatma Phule Jan Arogya — 100% Household Enrollment',      category: 'Promise',          department: 'Health',                    targetDate: 'Dec 2025' },
    { serial: 4,  title: 'PM Awas Yojana Urban — 2 Lakh Housing Units',               category: 'Promise',          department: 'Urban Development',         targetDate: 'Mar 2026' },
    { serial: 5,  title: 'Gharkul Awas Rural Housing — 1 Lakh Homes',                 category: 'Promise',          department: 'Rural Development',         targetDate: 'Jun 2026' },
    { serial: 6,  title: 'RTS 95% On-Time Disposal Rate Achievement',                  category: 'Promise',          department: 'Revenue',                   targetDate: 'Dec 2025' },
    { serial: 7,  title: 'Universal Ration Card Saturation — All Eligible Families',   category: 'Promise',          department: 'Food & Civil Supplies',     targetDate: 'Mar 2026' },
    { serial: 8,  title: 'Skill Maharashtra — 5 Lakh Youth Certified by FY End',       category: 'Promise',          department: 'Skill Development',         targetDate: 'Mar 2026' },
    { serial: 9,  title: 'Pune Metro Phase 2 — Civil Works Completion',                category: 'Project',          department: 'Urban Development',         targetDate: 'Dec 2027' },
    { serial: 10, title: 'Mumbai Coastal Road Extension — Phase 3',                    category: 'Project',          department: 'Public Works',              targetDate: 'Jun 2026' },
    { serial: 11, title: 'Bulk Drug Park Ratnagiri — Infrastructure Handover',         category: 'Project',          department: 'Industry',                  targetDate: 'Mar 2027' },
    { serial: 12, title: 'MSME Industrial Clusters — 10 New Zones Operational',        category: 'Project',          department: 'Industry',                  targetDate: 'Sep 2026' },
    { serial: 13, title: 'Nagpur Smart City Phase 3 — Core Systems Live',              category: 'Project',          department: 'Urban Development',         targetDate: 'Mar 2026' },
    { serial: 14, title: 'Jal Jeevan Mission — Rural Tap Connections (25L HH)',        category: 'Project',          department: 'Rural Development',         targetDate: 'Dec 2026' },
    { serial: 15, title: 'CM Solar Agriculture Pump — 2 Lakh Installations',           category: 'Project',          department: 'Agriculture',               targetDate: 'Jun 2026' },
    { serial: 16, title: 'Mega Textile Park Amravati — Phase 1 Operations',            category: 'Project',          department: 'Industry',                  targetDate: 'Sep 2026' },
    { serial: 17, title: 'Samruddhi Highway Feeder Roads — 300 km Completion',         category: 'Project',          department: 'Public Works',              targetDate: 'Mar 2026' },
    { serial: 18, title: 'Sanjay Gandhi Niradhar — Universal Pension Disbursement',    category: 'Cabinet Decision', department: 'Social Justice',            targetDate: 'Ongoing' },
    { serial: 19, title: 'OBC Scholarship Full FY Disbursement by March',              category: 'Cabinet Decision', department: 'Social Justice',            targetDate: 'Mar 2026' },
    { serial: 20, title: 'Tribal Hamlet Road Connectivity — 500 Hamlets',              category: 'Cabinet Decision', department: 'Tribal Welfare',            targetDate: 'Jun 2026' },
    { serial: 21, title: 'State Women Safety Framework — All Districts Covered',       category: 'Cabinet Decision', department: 'Home',                      targetDate: 'Dec 2025' },
    { serial: 22, title: 'Digital Health Records — All PHC Patients Onboarded',        category: 'Announcement',     department: 'Health',                    targetDate: 'Mar 2026' },
    { serial: 23, title: '100% Online RTS Service Migration — All 34 Services',        category: 'Announcement',     department: 'IT / MahaIT',               targetDate: 'Jun 2026' },
    { serial: 24, title: 'CM Farmer Helpline 24x7 — State-wide Rollout',               category: 'Announcement',     department: 'Agriculture',               targetDate: 'Dec 2025' },
    { serial: 25, title: 'E-Governance CSC Expansion — 500 New Service Centres',       category: 'Announcement',     department: 'IT / MahaIT',               targetDate: 'Mar 2026' },
  ];

  const BASE_PROGRESS = [92,84,72,55,68,80,76,63,42,58,48,61,78,52,45,39,74,95,88,57,83,66,48,90,69];

  const MILESTONES = [
    'DBT saturation expanded to 34 districts; 4 tribal districts in active drive',
    'Aadhaar seeding completed for 8.4M farmers; linkage pending for 0.8M',
    'Camp enrollment model validated in 14 districts; scaling to remaining 22',
    'Foundation work complete on 8,400 units; structural work at 62%',
    'Land allocation completed in all 6 divisions; construction started in 28 districts',
    'Officer accountability portal live; disposal rate at 82% — target is 95%',
    'Field survey complete; digitization of records ongoing in 22 districts',
    'Assessment centres operational in 22 districts; 3.8L certifications done',
    'Civil work at 48%; pier construction ongoing; target delayed by 6 months',
    'Tunnel boring at 74%; expected completion revised to Q2 FY27',
    'Land acquisition complete; environmental clearance received; civil work 22%',
    'Land allocated in 8 of 10 zones; 4 zones have anchor tenant MoUs signed',
    'Core network infra live; 3 of 8 city modules operational',
    'Pipeline laid for 18L HH; final-mile connections pending for 7L households',
    'Procurement complete for 1.4L pumps; installation ongoing in Amravati division',
    'Site development 60% complete; shed construction started for Phase 1',
    'Alignment finalized; contractor mobilized; 140 km of 300 km graded',
    'Monthly disbursement cycle stable; coverage at 94% of enrolled pensioners',
    'Disbursement portal updated; 91% of FY applications cleared',
    'Surveying complete for 480 hamlets; road work started in 310 hamlets',
    'All 36 districts have district-level nodes; training completed for 2,200 officers',
    'Pilot live in 6 districts; ABHA ID integration under testing',
    '28 of 34 services migrated; 6 services require backend API development',
    'IVR system deployed; 18 regional language scripts finalized',
    'Site identified for 420 centres; 180 operational; 320 under fit-out',
  ];

  const RATIONALES = [
    'Strong month-on-month enrollment growth; DBT reconciliation shows <2% leakage',
    'Seeding acceleration post-October; bank linkage gap concentrated in 3 districts',
    'Camp model showing 3x conversion vs digital-only; scale-up order issued',
    'Contractor capacity constraints causing delay in 2 packages; escalation needed',
    'On schedule but land conflicts in 4 districts risk Q4 target',
    'Processing time improved from 9.2 to 5.4 days avg; SLA breach rate falling',
    'Digitization pace below target; additional NIC resources needed',
    'Assessment throughput constrained by assessor availability in rural districts',
    'Utility relocation and soil issues caused 6-month delay; revised timeline approved',
    'Tunnel work proceeding on revised schedule; no further delays expected',
    'Raw material price escalation affecting contractor margins; renegotiation ongoing',
    'Anchor tenant acquisition ahead of schedule in 3 clusters',
    'Data centre integration with legacy SCADA systems taking longer than planned',
    'Pump delivery delays from OEM; revised delivery schedule received',
    'Last-mile connection constrained by DBOT contractor bandwidth',
    'Supply chain normalization after Q2 disruptions; back on track',
    'Contractor mobilization complete; progress per target for Q3',
    'Coverage high but Aadhaar mapping errors causing disbursement delays for 6% of beneficiaries',
    'March deadline achievable; 9% applications under verification hold',
    'Forest clearance delays affecting 70 hamlets; alternative routing being explored',
    'Awareness gap in urban districts; targeted campaign underway',
    'ABHA onboarding taking longer due to PHC connectivity issues in 8 districts',
    'Backend API development for 6 services blocked by legacy system dependencies',
    'Multi-lingual IVR rollout ahead of schedule; farmer adoption tracking positive',
    'Site identification bottleneck cleared; construction pace now on target',
  ];

  const OFFICER_REVIEWS = [
    'Reviewed by Secretary WCD — 4 days ago · Action: Enrollment drive in tribal districts',
    'Reviewed by Secretary Agriculture — 7 days ago · Action: Aadhaar linkage camp ordered',
    'Reviewed by Secretary Health — 3 days ago · Action: Scale camp model to 10 more districts',
    'Reviewed by Secretary Urban Dev — 10 days ago · Action: Contractor meeting scheduled',
    'Reviewed by Secretary Rural Dev — 6 days ago · Action: Land conflict resolution meeting held',
    'Reviewed by Secretary Revenue — 5 days ago · Action: Training for 200 additional officers',
    'Reviewed by Secretary Food — 8 days ago · Action: NIC resource deployment approved',
    'Reviewed by Secretary Skill — 9 days ago · Action: Assessor empanelment drive launched',
    'Reviewed by Commissioner Metro — 12 days ago · Action: Revised DPR submitted to CM',
    'Reviewed by Chief Engineer PWD — 8 days ago · Action: Utility relocation escalated',
    'Reviewed by Secretary Industry — 14 days ago · Action: Price escalation clause invoked',
    'Reviewed by CEO MIDC — 5 days ago · Action: Anchor tenant MoU signing scheduled',
    'Reviewed by Commissioner Smart City — 6 days ago · Action: SCADA integration task force formed',
    'Reviewed by ENC Jal Jeevan — 11 days ago · Action: OEM escalation by Principal Secretary',
    'Reviewed by Commissioner Agriculture — 7 days ago · Action: Revised delivery timeline locked',
    'Reviewed by CEO MIDC — 4 days ago · Action: Supply chain status weekly review',
    'Reviewed by ENC PWD — 3 days ago · Action: Q3 milestone review meeting done',
    'Reviewed by Secretary Social Justice — 6 days ago · Action: Aadhaar correction portal launched',
    'Reviewed by Director Social Justice — 2 days ago · Action: Verification hold review underway',
    'Reviewed by Secretary Tribal Welfare — 8 days ago · Action: Forest clearance follow-up with GoI',
    'Reviewed by DGP / Home Secretary — 5 days ago · Action: Awareness campaign materials sent',
    'Reviewed by Secretary Health — 7 days ago · Action: NIC connectivity upgrade ordered',
    'Reviewed by CEO MahaIT — 9 days ago · Action: Legacy API migration approved',
    'Reviewed by Secretary Agriculture — 3 days ago · Action: Launch event scheduled for Dec',
    'Reviewed by CEO MahaIT — 4 days ago · Action: Construction pace review done',
  ];

  return TEMPLATES.map((t, i) => {
    const base = BASE_PROGRESS[i];
    const prog = Math.min(100, Math.max(0, base + r(-4, 4)));
    const status =
      prog >= 95 ? 'Completed' :
      prog >= 72 ? pick(['On Track', 'On Track', 'At Risk']) :
      prog >= 48 ? pick(['At Risk', 'At Risk', 'On Track', 'Delayed']) :
                   pick(['Delayed', 'At Risk', 'Delayed']);
    const aiSignal =
      status === 'Completed' ? 'Low' :
      status === 'On Track'  ? pick(['Low', 'Low', 'Medium']) :
      status === 'At Risk'   ? pick(['Medium', 'High']) :
                               pick(['High', 'Critical']);
    const confidence = status === 'Completed' ? r(92, 98) : status === 'On Track' ? r(82, 92) : status === 'At Risk' ? r(72, 84) : r(60, 78);
    return {
      ...t,
      id: `PRI-${String(t.serial).padStart(3, '0')}`,
      progressPct: prog,
      status,
      aiSignal,
      confidence,
      lastMilestone: MILESTONES[i],
      aiRationale:  RATIONALES[i],
      officerReview: OFFICER_REVIEWS[i],
    };
  });
};

// ---- CM Daily Intelligence Brief -----------------------------------------------
const buildCMBrief = (districts, departments) => {
  const dname = () => pick(flatDistricts()).name;
  const div = () => pick(DIVISIONS);
  const dept = () => pick(DEPARTMENTS);

  const INSIGHTS = [
    { title: `State Governance Health Index at ${r(78, 86)} — strongest composite in 4 months`, source: 'Integrated Intelligence Layer · All Departments', rationale: `Composite improvement driven by RTS disposal acceleration (+${r(12,22)}%), welfare coverage gains in ${div()} division, and revenue buoyancy in Pune-Nashik cluster.`, confidence: r(88, 95), geography: 'State-wide', department: 'CMO / Chief Secretary', priority: 'Low' },
    { title: `Ladki Bahin Yojana DBT saturation reaches ${r(91, 96)}% — month-on-month high`, source: 'MahaDBT Portal · Women & Child Development', rationale: `Direct bank transfer linkage improved across ${r(28,34)} districts. Remaining gap concentrated in 4 tribal districts including Gadchiroli and Nandurbar.`, confidence: r(91, 97), geography: 'State-wide', department: 'Women & Child Development', priority: 'Low' },
    { title: `Revenue collection at ${r(78, 84)}% of FY target — GST buoyancy above estimate`, source: 'Finance Department · GST Intelligence', rationale: `GST collections in Pune and Nashik divisions running ${r(6,12)}% above seasonal baseline. Stamp duty revenue strong in urban districts.`, confidence: r(86, 93), geography: `${div()} Division`, department: 'Finance', priority: 'Low' },
    { title: `RTS disposal rate improved by ${r(12, 20)}% across ${r(18, 26)} districts in 30 days`, source: 'Aaple Sarkar Portal · Revenue Department', rationale: `Process digitization and additional staffing interventions in Konkan and Pune divisions showing measurable throughput improvement.`, confidence: r(85, 92), geography: 'Konkan · Pune Divisions', department: 'Revenue', priority: 'Low' },
    { title: `Infrastructure project completion rate at ${r(78, 86)}% — ahead of Q3 target`, source: 'Infrastructure Intelligence Layer', rationale: `${r(42, 58)} projects completed ahead of schedule in ${div()} and ${div()} divisions. Contractor performance ratings improved after last quarter's review.`, confidence: r(82, 90), geography: `${div()} Division`, department: 'Urban Development', priority: 'Low' },
    { title: `Citizen satisfaction index up to ${r(80, 88)} — online service adoption at ${r(68, 78)}%`, source: 'MahaIT · Citizen Feedback Portal', rationale: `Online service adoption increasing steadily in semi-urban districts. Turnaround time for digital certificates reduced from 5.2 to ${rf(2.8, 3.6, 1)} days avg.`, confidence: r(80, 88), geography: 'State-wide', department: 'IT / MahaIT', priority: 'Low' },
    { title: `Welfare coverage gap narrowed in ${r(8, 14)} tribal districts — Namo Shetkari saturation at ${r(88, 94)}%`, source: 'Tribal Welfare Department · MahaDBT', rationale: `Sustained outreach camps and Gram Sabha mobilization in Amravati and Nagpur divisions yielding enrollment surge in underserved talukas.`, confidence: r(87, 93), geography: 'Amravati · Nagpur Divisions', department: 'Tribal Welfare', priority: 'Medium' },
    { title: `Health scheme enrollment: Mahatma Phule Jan Arogya covers ${r(88, 94)}% of eligible households`, source: 'Health Department · DGIPR Portal', rationale: `ASHA worker mobilization and Collector-level camps in ${r(12, 18)} districts closed enrollment gaps. Urban slum areas remain partially covered.`, confidence: r(84, 91), geography: 'State-wide', department: 'Health', priority: 'Medium' },
    { title: `Education attendance recovery post-monsoon at ${r(88, 94)}% — ${r(4, 8)} districts below 85% threshold`, source: 'Education Department · Saral Portal', rationale: `Overall attendance recovery is strong. ${r(4,8)} districts in Marathwada belt showing slower recovery — teacher shortage cited as primary factor.`, confidence: r(82, 89), geography: 'Aurangabad Division', department: 'Education', priority: 'Medium' },
    { title: `Grievance resolution avg time down to ${rf(3.5, 5.5, 1)} days — ${r(88, 95)}% within SLA`, source: 'PGRS · Aapli Sarkar Portal', rationale: `Officer-level accountability dashboard deployment showing impact. Backlog clearing fastest in ${div()} division with new workflow tooling.`, confidence: r(85, 92), geography: `${div()} Division`, department: dept(), priority: 'Low' },
    { title: `Agricultural distress signals subsiding in ${div()} — Rabi sowing up ${r(8, 16)}% YoY`, source: 'Agriculture Department · Crop Insurance Portal', rationale: `Above-average monsoon distribution and input subsidy timely release contributing to improved farmer sentiment and reduced distress calls.`, confidence: r(80, 88), geography: `${div()} Division`, department: 'Agriculture', priority: 'Low' },
    { title: `Urban development project execution improving — ${r(12, 22)} smart city milestones cleared`, source: 'Urban Development · Smart City Mission', rationale: `Project Management Units in ${r(5, 8)} cities submitted timely utilization certificates enabling next tranche release from Centre.`, confidence: r(82, 90), geography: 'Urban Districts', department: 'Urban Development', priority: 'Low' },
  ];

  const RISKS = [
    { title: `${r(4, 9)} districts show welfare delivery score below 60 — coverage deteriorating`, source: 'Welfare Intelligence Layer · MahaDBT', rationale: `Pattern of declining enrollment in last 3 monthly data cycles. District-level DBT reconciliation shows increasing bank linkage failures in ${dname()} cluster.`, confidence: r(85, 93), geography: `${dname()} · ${dname()}`, department: 'Women & Child Development', priority: 'Critical' },
    { title: `RTS SLA breach risk in ${dept()} — backlog at ${r(2, 4)}x division average`, source: 'Aaple Sarkar SLA Monitor · Revenue Dept', rationale: `Staffing gap after recent transfers compounded by Diwali application surge. If unaddressed, SLA breach rate will cross 20% threshold in 8 days.`, confidence: r(87, 94), geography: dname(), department: 'Revenue', priority: 'High' },
    { title: `Flood preparedness below threshold in ${r(4, 8)} coastal districts — monsoon peak approaching`, source: 'Disaster Management Intelligence · IMD Feeds', rationale: `Relief stock in ${dname()} and ${dname()} at 58% of prescribed minimum. Pre-positioned equipment audit shows ${r(3,6)} gap items requiring urgent procurement.`, confidence: r(88, 95), geography: 'Konkan Division', department: 'Disaster Management', priority: 'Critical' },
    { title: `Budget under-utilization in ${dept()} — only ${r(38, 54)}% utilized with Q3 end in 45 days`, source: 'Finance Intelligence · PFMS Integration', rationale: `Procurement delays due to vendor litigation have stalled ${r(8,14)} major works orders. Finance dept flagged this as fiscal closure risk.`, confidence: r(82, 90), geography: 'State-wide', department: 'Finance', priority: 'High' },
    { title: `Grievance spike: ${r(22, 38)}% surge in ${dname()} — primary: land records and revenue services`, source: 'PGRS Spike Detector · Revenue', rationale: `Post-digitization transition friction causing surge in citizen escalations related to 7/12 extract errors. Requires Collector-level review meeting.`, confidence: r(84, 91), geography: dname(), department: 'Revenue', priority: 'High' },
    { title: `DBT disbursement stall: ${r(18000, 42000)} beneficiaries pending >30 days — bank linkage issue`, source: 'MahaDBT Reconciliation Engine', rationale: `Aadhaar-bank seeding mismatch for ${r(18000, 42000)} accounts across ${r(6,12)} districts. Disproportionate in tribal areas with newer bank branch coverage.`, confidence: r(86, 93), geography: 'Amravati · Nagpur Divisions', department: 'Tribal Welfare', priority: 'High' },
    { title: `${r(14, 26)} infrastructure projects at critical delay risk — ${r(3, 7)} in CM priority list`, source: 'Infrastructure Execution Monitor', rationale: `Critical path analysis shows contractor capacity constraints and raw material price escalation causing schedule slippage. ${r(3,7)} projects have already triggered penalty clauses.`, confidence: r(81, 89), geography: `${div()} Division`, department: 'Urban Development', priority: 'High' },
    { title: `Revenue shortfall risk: ${div()} division GST collection ${r(6, 14)}% below monthly target`, source: 'Finance Intelligence · GST Analytics', rationale: `Manufacturing sector slowdown post-festival season and delayed arrears recovery contributing to shortfall. Risk of Q3 revenue target miss if trend persists.`, confidence: r(79, 88), geography: `${div()} Division`, department: 'Finance', priority: 'Medium' },
    { title: `Nandurbar, Gadchiroli showing welfare scheme saturation gap >25% — at-risk population uncovered`, source: 'Tribal Welfare Intelligence · Census Benchmarks', rationale: `Remoteness of habitations, connectivity barriers, and Jan Dhan account dormancy among contributing factors. Multi-agency intervention protocol triggered.`, confidence: r(88, 95), geography: 'Nandurbar · Gadchiroli', department: 'Tribal Welfare', priority: 'Critical' },
    { title: `Education: ${r(8, 16)} rural schools with teacher vacancy >40% — learning outcome risk`, source: 'Education Department · DISE Data', rationale: `Transfer-posting cycle has created acute teacher shortage in ${r(8,16)} schools across ${dname()} district. Board exam cohort at risk.`, confidence: r(82, 89), geography: dname(), department: 'Education', priority: 'High' },
  ];

  const OPPORTUNITIES = [
    { title: `Accelerate Ladki Bahin Yojana in ${r(6, 10)} uncovered districts — ${r(180000, 280000)} eligible women reachable`, source: 'Welfare Gap Intelligence · Census Benchmarks', rationale: `District-level eligibility mapping shows concentrated uncovered population in ${div()} belt. Targeted enrollment camp could close gap within 60 days.`, confidence: r(87, 94), geography: `${div()} Division`, department: 'Women & Child Development', priority: 'High' },
    { title: `Revenue buoyancy in ${div()} — GST ${r(8, 16)}% above estimate; opportunity to advance Q4 targets`, source: 'Finance Intelligence · GST Analytics', rationale: `Manufacturing and trade sector recovery in ${dname()} cluster creating upside revenue potential. Advance tax filing compliance also above average.`, confidence: r(84, 91), geography: `${div()} Division`, department: 'Finance', priority: 'Medium' },
    { title: `Digital RTS expansion to ${r(8, 14)} rural talukas — ${r(60000, 120000)} applications annually digitizable`, source: 'MahaIT · e-Governance Analytics', rationale: `Connectivity infrastructure in target talukas now sufficient for full digital services. Estimated annual benefit: ${r(45, 90)}k officer-hours recovered.`, confidence: r(82, 90), geography: `${div()} Division`, department: 'IT / MahaIT', priority: 'High' },
    { title: `Namo Shetkari Mahasanman enrollment drive — ${r(240000, 420000)} eligible but unenrolled farmers in ${div()}`, source: 'Agriculture Intelligence · PM-Kisan Seeding', rationale: `Cross-referencing land records with PM-Kisan data shows significant uncovered eligible population in ${dname()} and ${dname()}. Weekend Gram Sabha model proven effective in ${div()}.`, confidence: r(85, 92), geography: `${div()} · ${div()} Divisions`, department: 'Agriculture', priority: 'High' },
    { title: `Urban infrastructure monetization: ${r(12, 22)} projects eligible for PPP — ₹${r(2800, 5200)} Cr potential`, source: 'Urban Development Intelligence', rationale: `Due diligence complete on ${r(12, 22)} urban infrastructure assets suitable for operations & maintenance PPP model. Investor interest confirmed from 3 infrastructure funds.`, confidence: r(80, 88), geography: 'Urban Districts', department: 'Urban Development', priority: 'Medium' },
    { title: `Health: ${r(180000, 320000)} households eligible for Mahatma Phule Jan Arogya not yet enrolled in ${dname()} cluster`, source: 'Health Intelligence · PMJAY Seeding', rationale: `Household-level gap analysis using ration card and Aadhaar linkage reveals uncovered eligible population. Rashtriya Swasthya Bima data crosswalk confirms gap.`, confidence: r(84, 91), geography: dname(), department: 'Health', priority: 'High' },
    { title: `Education technology integration — ${r(420, 640)} schools eligible for digital classroom upgrade`, source: 'Education Department · Infrastructure Survey', rationale: `Schools with existing power + connectivity infrastructure ready for Samagra Shiksha digital classroom rollout. Can be completed in ${r(3,5)} months within existing budget.`, confidence: r(81, 89), geography: `${div()} Division`, department: 'Education', priority: 'Medium' },
    { title: `Cross-departmental data integration could clear ${r(28, 45)}k duplicate grievances — joint resolution protocol`, source: 'PGRS Analytics · Multiple Departments', rationale: `Pattern analysis shows ${r(28, 45)}k grievances involve multi-department resolution but are siloed in individual department queues. Joint protocol can reduce resolution time by 40%.`, confidence: r(83, 90), geography: 'State-wide', department: 'Revenue', priority: 'Medium' },
    { title: `Rural livelihood push: SHG loan disbursement target achievable with ${r(3,6)} district-level camps`, source: 'Rural Development Intelligence · NRLM', rationale: `${r(42000, 68000)} SHG members awaiting loan disbursement approval across ${r(8, 14)} districts. Backlogs are procedural, not merit-related — camp model can clear in 4 weeks.`, confidence: r(82, 89), geography: `${div()} Division`, department: 'Rural Development', priority: 'High' },
    { title: `Social Justice: OBC scholarship disbursement for FY underway — ${r(82, 91)}% released; push needed for ${r(9, 18)}%`, source: 'Social Justice Intelligence · MahaDBT', rationale: `Remaining ${r(9,18)}% held back due to verification queue. Targeted officer deployment for 2 weeks can complete FY disbursement before March closure.`, confidence: r(85, 92), geography: 'State-wide', department: 'Social Justice', priority: 'Medium' },
  ];

  const INTERVENTIONS = [
    { title: `Deploy ${r(20, 45)} additional RTS officers to ${dname()} for 30-day SLA recovery mission`, source: 'RTS Intelligence · SLA Breach Heatmap', rationale: `Backlog clearance requires ${r(20,45)} additional officer-days/week. Nearest available pool from ${div()} division. CM-level directive needed for inter-division deployment.`, confidence: r(86, 93), geography: dname(), department: 'Revenue', priority: 'Critical' },
    { title: `Issue 48-hour action plan directive to Collectors in ${r(4, 7)} red-flagged districts`, source: 'District Governance Score · Intelligence Layer', rationale: `${r(4,7)} districts have crossed 3 simultaneous risk thresholds: welfare gap >20%, RTS backlog >3k, and grievance spike >30%. Pattern warrants CM-level monitoring.`, confidence: r(88, 95), geography: `${dname()} · ${dname()} · ${dname()}`, department: 'CMO / Chief Secretary', priority: 'Critical' },
    { title: `Expedite DBT bank linkage for ${r(18, 42)}k pending Ladki Bahin beneficiaries — NIC technical team intervention`, source: 'MahaDBT Reconciliation · NIC', rationale: `Technical root cause: Aadhaar mapper seeding failures due to name mismatch. NIC has patch ready but requires State NIC Coordinator approval and district BC deployment.`, confidence: r(87, 94), geography: 'Amravati Division', department: 'Women & Child Development', priority: 'High' },
    { title: `Emergency flood preparedness review meeting for ${r(5, 9)} coastal districts — 72-hour window`, source: 'Disaster Intelligence · IMD Extended Forecast', rationale: `IMD 10-day forecast shows 70% probability of above-average rainfall in Konkan belt. Relief stock audit and pre-positioning needs Collector-level confirmation within 72 hours.`, confidence: r(89, 96), geography: 'Konkan Division', department: 'Disaster Management', priority: 'Critical' },
    { title: `Release accelerated budget allocation for ${dept()} — Q3 fiscal closure risk`, source: 'Finance Intelligence · PFMS', rationale: `If quarterly release not issued in next 10 days, executing agencies cannot absorb allocation before Q3 close. Will result in lapse of ₹${r(400, 800)} Cr and underperformance reporting.`, confidence: r(84, 91), geography: 'State-wide', department: 'Finance', priority: 'High' },
    { title: `Welfare enrollment camp in ${dname()} — ${r(12000, 28000)} eligible women still unreached`, source: 'Welfare Gap Intelligence · Gram Sabha Data', rationale: `Last camp coverage was ${r(3, 5)} months ago. Population eligible for Ladki Bahin + PM Kisan combination has not been reached via digital channels due to low mobile penetration.`, confidence: r(86, 93), geography: dname(), department: 'Women & Child Development', priority: 'High' },
    { title: `Review and accelerate ${r(12, 20)} stalled infrastructure projects in ${div()} division`, source: 'Infrastructure Execution Monitor', rationale: `These projects are in the CM priority infrastructure list and have missed 2 consecutive quarterly milestones. Escalation to PWD Secretary + Finance release needed.`, confidence: r(83, 90), geography: `${div()} Division`, department: 'Urban Development', priority: 'High' },
    { title: `IT system intervention for ${dept()} grievance queue — ${r(12000, 28000)} stuck applications`, source: 'PGRS Analytics · IT Operations', rationale: `Database locking issue identified in ${dept()} portal causing ${r(12000, 28000)} applications to stall in "processing" state for >15 days. Ticket with NIC team already raised — CM-level flag needed for priority resolution.`, confidence: r(88, 95), geography: 'State-wide', department: 'IT / MahaIT', priority: 'High' },
    { title: `Personal CM review meeting for ${r(3, 5)} critical districts — ${pick(['Gadchiroli', 'Beed', 'Nandurbar', 'Washim', 'Palghar'])} proposed`, source: 'District Performance Intelligence · All Indices', rationale: `Districts have multi-dimensional underperformance across welfare, RTS, revenue and infrastructure. Direct CM engagement historically shown 40-60% improvement in 90-day period.`, confidence: r(85, 92), geography: `${pick(['Gadchiroli', 'Beed', 'Nandurbar', 'Washim', 'Palghar'])} · ${pick(['Yavatmal', 'Hingoli', 'Dharashiv', 'Gondia'])}`, department: 'CMO / Chief Secretary', priority: 'Critical' },
    { title: `Cross-departmental task force for tribal welfare saturation — Amravati + Nagpur divisions`, source: 'Tribal Intelligence · Multiple Schemes', rationale: `${r(6, 10)} schemes have overlapping uncovered populations in tribal belt. Single coordinated camp combining Health, Education, Revenue, and Welfare verticals can maximize impact per officer-day.`, confidence: r(84, 91), geography: 'Amravati · Nagpur Divisions', department: 'Tribal Welfare', priority: 'High' },
  ];

  const shuffle = (arr) => [...arr].sort(() => rnd() - 0.5);
  const take10 = (arr, prefix) =>
    shuffle(arr).slice(0, 10).map((x, i) => ({ ...x, id: `${prefix}-${String(i + 1).padStart(3, '0')}` }));

  return {
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    briefTime: '06:00 IST',
    generatedAt: new Date().toISOString(),
    insights: take10(INSIGHTS, 'INS'),
    risks: take10(RISKS, 'RSK'),
    opportunities: take10(OPPORTUNITIES, 'OPP'),
    interventions: take10(INTERVENTIONS, 'INT'),
  };
};

// ----

const applyDistrictFilters = (rows, q) => {
  let out = rows;
  if (q.division) out = out.filter((x) => x.division === q.division);
  if (q.district) out = out.filter((x) => (x.district || x.name) === q.district);
  if (q.risk) out = out.filter((x) => x.riskLevel === q.risk || x.level === q.risk);
  if (q.urbanRural) out = out.filter((x) => x.urbanRural === q.urbanRural);
  return out;
};

const tick = () => reseed(42 + Math.floor(Date.now() / 60000));

const META = {
  simulated: true,
  notice: 'Indicative data — grounded in public figures with modelled estimates. NOT official government data.',
  governance: ['Human-in-the-loop', 'DPDP-aware', 'Role-based access control', 'Audit-ready', 'Explainable AI'],
};

export function getData(path, params = {}) {
  tick();
  const districts = buildDistricts();
  const departments = buildDepartments();
  const wrap = (data) => ({ data, _meta: { ...META, generatedAt: new Date().toISOString() } });

  switch (path) {
    case '/overview': return wrap(buildOverview(districts, departments));
    case '/departments': {
      let out = departments;
      if (params.department) out = out.filter((d) => d.department === params.department);
      if (params.risk) out = out.filter((d) => d.riskLevel === params.risk);
      return wrap(out);
    }
    case '/districts': return wrap(applyDistrictFilters(districts, params));
    case '/welfare': return wrap(buildWelfare());
    case '/rts': return wrap(buildRTS());
    case '/mahadbt': return wrap(buildMahaDBT());
    case '/revenue': return wrap(buildRevenue());
    case '/disaster': return wrap(buildDisaster());
    case '/law-order': return wrap(buildLawOrder());
    case '/cyber': return wrap(buildCyber());
    case '/audit-logs': return wrap(buildAuditLogs());
    case '/alerts': {
      let out = buildAlerts(districts);
      if (params.priority) out = out.filter((a) => a.priority === params.priority);
      return wrap(out);
    }
    case '/cm-brief': return wrap(buildCMBrief(districts, departments));
    case '/cm-priority': return wrap(buildCMPriority());
    case '/meta':
      return wrap({ divisions: DIVISIONS, districts: DISTRICTS, departments: DEPARTMENTS, schemes: SCHEMES, rtsServices: RTS_SERVICES });
    default:
      throw new Error('Unknown data path: ' + path);
  }
}
