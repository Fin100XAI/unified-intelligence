// ============================================================================
// App shell: sticky topbar, desktop sidebar, mobile bottom nav, global filter
// drawer. Fully responsive — no overlap on mobile.
// ============================================================================
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, SlidersHorizontal, RotateCcw, ShieldCheck, Radio,
} from 'lucide-react';
import { NAV, MOBILE_NAV } from '../data/nav.js';
import { useFilters } from '../context/FilterContext.jsx';
import { useApi } from '../api.js';
import { SimBadge } from './ui.jsx';

const Seal = () => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-saffron via-gold to-emerald-600 text-white shadow-lg ring-2 ring-white/20">
    <ShieldCheck size={22} />
  </div>
);

// Live wall-clock — reinforces the real-time operations feel.
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 sm:flex">
      <Radio size={14} className="animate-pulse" />
      <span className="tabular-nums">{now.toLocaleTimeString('en-IN', { hour12: false })}</span>
    </div>
  );
}

// --- Global filter controls (shared desktop bar + mobile drawer) -------------
const FY = ['FY 2025-26', 'FY 2024-25', 'FY 2023-24'];
const PERIODS = ['Last 7 days', 'Last 30 days', 'This Quarter', 'FY 2025-26'];
const RISKS = ['Critical', 'High', 'Medium', 'Low'];
const SVC = ['Certificate', 'Welfare', 'Revenue', 'Health', 'Education'];

function FilterControls({ stacked }) {
  const { filters, setFilter } = useFilters();
  const { data: meta } = useApi('/meta');
  const districts = filters.division && meta?.districts ? meta.districts[filters.division] : Object.values(meta?.districts || {}).flat();

  const Sel = ({ k, label, opts }) => (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <select value={filters[k]} onChange={(e) => setFilter(k, e.target.value)}
        className="rounded-lg border border-slate-200/70 bg-white/70 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-saffron/40 dark:border-white/10 dark:bg-white/5">
        <option value="">All</option>
        {opts?.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <div className={stacked ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap items-end gap-3'}>
      <Sel k="division" label="Division" opts={meta?.divisions} />
      <Sel k="district" label="District" opts={districts} />
      <Sel k="department" label="Department" opts={meta?.departments} />
      <Sel k="scheme" label="Scheme" opts={meta?.schemes} />
      <Sel k="risk" label="Risk Level" opts={RISKS} />
      <Sel k="urbanRural" label="Urban / Rural" opts={['Urban', 'Rural']} />
      <Sel k="serviceCategory" label="Service Category" opts={SVC} />
      <Sel k="priority" label="Priority" opts={RISKS} />
      <Sel k="financialYear" label="Financial Year" opts={FY} />
      <Sel k="period" label="Time Period" opts={PERIODS} />
    </div>
  );
}

export default function Layout({ children }) {
  const { reset, activeCount } = useFilters();
  const [sidebar, setSidebar] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="cmd-bg min-h-screen">
      {/* ---------- Sticky Topbar ---------- */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5">
          <button className="rounded-lg p-2 hover:bg-slate-500/10 lg:hidden" onClick={() => setSidebar(true)}><Menu size={20} /></button>
          <Seal />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-extrabold leading-tight sm:text-base">Maharashtra State Governance Nerve Center</h1>
            <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">AI Operating Layer for Maharashtra Governance · MahaIT</p>
          </div>
          <div className="hidden md:block"><SimBadge /></div>
          <button onClick={() => setFilterOpen(true)} className="relative rounded-lg p-2 hover:bg-slate-500/10">
            <SlidersHorizontal size={18} />
            {activeCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-saffron text-[10px] font-bold text-white">{activeCount}</span>}
          </button>
          <button className="relative rounded-lg p-2 hover:bg-slate-500/10"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /></button>
          <LiveClock />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {/* ---------- Desktop Sidebar ---------- */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 shrink-0 overflow-y-auto border-r border-slate-200/60 px-3 py-4 dark:border-white/10 lg:block">
          <SidebarNav />
        </aside>

        {/* ---------- Mobile Sidebar drawer ---------- */}
        <AnimatePresence>
          {sidebar && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebar(false)} />
              <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 26 }}
                className="glass fixed left-0 top-0 z-50 h-full w-72 overflow-y-auto px-3 py-4 lg:hidden">
                <div className="mb-4 flex items-center justify-between px-2">
                  <span className="font-bold">Navigation</span>
                  <button onClick={() => setSidebar(false)} className="rounded-lg p-1.5 hover:bg-slate-500/10"><X size={18} /></button>
                </div>
                <SidebarNav onNavigate={() => setSidebar(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ---------- Main content ---------- */}
        <main key={loc.pathname} className="min-w-0 flex-1 px-3 pb-24 pt-4 sm:px-5 lg:pb-8">{children}</main>
      </div>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-slate-200/60 dark:border-white/10 lg:hidden">
        {MOBILE_NAV.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === '/'}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[10px] ${isActive ? 'text-saffron' : 'text-slate-500'}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ---------- Filter drawer ---------- */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} />
            <motion.div initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }} transition={{ type: 'spring', damping: 28 }}
              className="glass fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Global Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-500/10"><X size={18} /></button>
              </div>
              <p className="mb-4 text-xs text-slate-400">Filters update every card, chart, table and alert live.</p>
              <FilterControls stacked />
              <div className="mt-6 flex gap-2">
                <button onClick={reset} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 py-2 text-sm font-semibold dark:border-white/15"><RotateCcw size={14} />Reset</button>
                <button onClick={() => setFilterOpen(false)} className="flex-1 rounded-lg bg-saffron py-2 text-sm font-semibold text-white">Apply</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarNav({ onNavigate }) {
  return (
    <nav className="space-y-5">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.group}</p>
          <div className="space-y-0.5">
            {group.items.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path} end={path === '/'} onClick={onNavigate}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-gradient-to-r from-saffron/20 to-transparent text-saffron ring-1 ring-saffron/30'
                           : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>
                <Icon size={18} /><span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
