// ============================================================================
// Maharashtra Governance — in-app data layer (no backend).
// Figures are indicative: grounded in public Maharashtra statistics with small
// per-minute drift so the dashboard feels live. NOT official government data.
// ============================================================================

// --- Seeded pseudo-random; reseeded per call so values drift over time --------
let _seed = 42;
const reseed = (s) => { _seed = ((Math.floor(s) % 233280) + 233280) % 233280 || 1; };
const rnd = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
const r = (min, max) => Math.round(min + rnd() * (max - min));
const rf = (min, max, d = 1) => +(min + rnd() * (max - min)).toFixed(d);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// --- Maharashtra reference master data ---------------------------------------
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

// Real-world anchors (approx. public figures, FY 2024-25 / 2025-26):
// eligible beneficiaries + annual outlay in ₹ crore.
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
    district: d.district, department: pick(DEPARTMENTS), priority: pick(['Critical', 'High']), ageDays: r(1, 21),
  })).sort(() => rnd() - 0.5).slice(0, 5);
  return {
    governanceHealthScore: 72, departmentsMonitored: departments.length, districtsMonitored: districts.length,
    criticalAlerts: r(28, 64), rtsPending: r(180000, 240000), welfareGapPct: rf(8, 22),
    disasterRiskDistricts: districts.filter((d) => d.disasterVulnerability > 65).length,
    revenueCollectionCr: drift(395000, 0.04), revenueTargetCr: 490000, topEscalations: escalations,
    deptRanking: departments.map((d) => ({ department: d.department, healthScore: d.healthScore }))
      .sort((a, b) => b.healthScore - a.healthScore),
    healthTrend: months.map((m) => ({ month: m, score: r(60, 80) })),
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

const buildRevenue = () => ({
  targetCr: 490000, collectedCr: drift(395000, 0.04),
  fiscalPressureScore: r(40, 78), salaryBurnPct: rf(34, 52),
  grantUtilizationPct: rf(58, 92), procurementEfficiencyPct: rf(62, 90),
  byDepartmentExpenditure: DEPARTMENTS.map((d) => ({ department: d, allocatedCr: r(4000, 90000), spentCr: r(2000, 80000) })),
  anomalyFlags: Array.from({ length: 6 }, () => ({
    id: 'FIN-' + r(1000, 9999), department: pick(DEPARTMENTS),
    type: pick(['Unusual spend spike', 'Procurement variance', 'Grant under-utilization', 'Duplicate vendor']),
    severity: pick(RISK),
  })),
  byDistrictUtilization: flatDistricts().map(({ name }) => ({ district: name, utilizationPct: rf(45, 98) })),
});

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
  cyberReadinessScore: r(58, 84), certInAlignmentPct: rf(70, 95), dataProtectionPct: rf(72, 96),
  explainabilityScore: rf(74, 92), humanInLoopApprovalPct: rf(88, 99),
  aiModelAuditStatus: pick(['Passed', 'Review Pending', 'Passed']),
  deptPosture: DEPARTMENTS.map((d) => ({ department: d, postureScore: r(50, 95), openVulns: r(0, 40) })),
  vulnerabilityAlerts: Array.from({ length: 5 }, () => ({
    id: 'CVE-' + r(2023, 2026) + '-' + r(1000, 9999), severity: pick(RISK),
    department: pick(DEPARTMENTS), status: pick(['Open', 'Patching', 'Mitigated']),
  })),
  accessLogs: Array.from({ length: 6 }, () => ({
    id: 'RBAC-' + r(1000, 9999), role: pick(['District Collector', 'Principal Secretary', 'MahaIT Admin', 'Divisional Commissioner']),
    action: pick(['Viewed dashboard', 'Exported report', 'Approved recommendation', 'Accessed audit log']),
    time: r(1, 59) + ' min ago',
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

const applyDistrictFilters = (rows, q) => {
  let out = rows;
  if (q.division) out = out.filter((x) => x.division === q.division);
  if (q.district) out = out.filter((x) => (x.district || x.name) === q.district);
  if (q.risk) out = out.filter((x) => x.riskLevel === q.risk || x.level === q.risk);
  if (q.urbanRural) out = out.filter((x) => x.urbanRural === q.urbanRural);
  return out;
};

// Reseed on a 1-minute bucket: stable within a minute, gentle drift each minute.
const tick = () => reseed(42 + Math.floor(Date.now() / 60000));

const META = {
  simulated: true,
  notice: 'Indicative data — grounded in public figures with modelled estimates. NOT official government data.',
  governance: ['Human-in-the-loop', 'DPDP-aware', 'Role-based access control', 'Audit-ready', 'Explainable AI'],
};

// Single entry point — mirrors the previous REST API contract.
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
    case '/meta':
      return wrap({ divisions: DIVISIONS, districts: DISTRICTS, departments: DEPARTMENTS, schemes: SCHEMES, rtsServices: RTS_SERVICES });
    default:
      throw new Error('Unknown data path: ' + path);
  }
}
