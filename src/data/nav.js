import {
  LayoutDashboard, Building2, MapPinned, HeartHandshake, FileClock, Banknote,
  TrendingUp, CloudRain, ShieldAlert, HardHat, ShieldCheck, ScrollText,
  UserCog, Briefcase, Crown, Newspaper, Activity, ListChecks,
} from 'lucide-react';

// Single source of truth for routing + sidebar + mobile nav.
export const NAV = [
  { group: 'Command', items: [
    { path: '/', label: 'State Command', icon: LayoutDashboard },
    { path: '/cmo', label: 'CMO Executive View', icon: Crown },
    { path: '/cm-brief', label: 'CM Daily Brief', icon: Newspaper },
    { path: '/cm-priority', label: 'CM Priority Tracker', icon: ListChecks },
  ]},
  { group: 'Intelligence', items: [
    { path: '/revenue', label: 'Revenue & Fiscal', icon: TrendingUp },
    { path: '/law-order', label: 'Law & Order', icon: ShieldAlert },
    { path: '/departments', label: 'Department Health', icon: Building2 },
    { path: '/districts', label: 'District Governance', icon: MapPinned },
    { path: '/welfare', label: 'Welfare Assurance', icon: HeartHandshake },
    { path: '/rts', label: 'Citizen Service (RTS)', icon: FileClock },
    { path: '/mahadbt', label: 'MahaDBT Assurance', icon: Banknote },
    { path: '/disaster', label: 'Disaster & Resilience', icon: CloudRain },
    { path: '/infrastructure', label: 'Infrastructure', icon: HardHat },
  ]},
  { group: 'Trust & Audit', items: [
    { path: '/cyber', label: 'Cyber & AI Trust', icon: ShieldCheck },
    { path: '/audit', label: 'AI Alerts & Audit', icon: ScrollText },
  ]},
  { group: 'Role Views', items: [
    { path: '/collector', label: 'District Collector', icon: UserCog },
    { path: '/secretary', label: 'Principal Secretary', icon: Briefcase },
  ]},
];

// Flat list for routing.
export const ROUTES = NAV.flatMap((g) => g.items);

// Bottom-nav (mobile) — 5 most-used.
export const MOBILE_NAV = [
  ROUTES[0],
  { path: '/cm-brief', label: 'Daily Brief', icon: Newspaper },
  { path: '/districts', label: 'Districts', icon: MapPinned },
  { path: '/welfare', label: 'Welfare', icon: HeartHandshake },
  { path: '/audit', label: 'Audit', icon: ScrollText },
];
