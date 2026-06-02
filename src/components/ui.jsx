// ============================================================================
// Shared UI primitives — cards, KPIs, badges, tables, modals, skeletons,
// trust labels, simulated-data badge, empty/error states, export/search/sort.
// ============================================================================
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Database, Lock, ScrollText, Brain, Server, Download, Search,
  ArrowUpDown, X, AlertTriangle, Inbox, TrendingUp, TrendingDown,
} from 'lucide-react';

// --- Risk / priority color tokens --------------------------------------------
export const riskColor = (level) => ({
  Critical: 'text-red-500 bg-red-500/10 ring-red-500/30',
  High: 'text-orange-500 bg-orange-500/10 ring-orange-500/30',
  Medium: 'text-amber-500 bg-amber-500/10 ring-amber-500/30',
  Low: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/30',
}[level] || 'text-slate-500 bg-slate-500/10 ring-slate-500/30');

export const scoreColor = (s) =>
  s >= 80 ? '#10b981' : s >= 65 ? '#f59e0b' : s >= 50 ? '#f97316' : '#ef4444';

// --- Badge --------------------------------------------------------------------
export const Badge = ({ children, level, className = '' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${level ? riskColor(level) : 'bg-slate-500/10 text-slate-500 ring-slate-500/20'} ${className}`}>
    {children}
  </span>
);

// --- "Simulated Data" badge ---------------------------------------------------
export const SimBadge = ({ className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-500/30 ${className}`}>
    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
    Indicative Data · Public figures + live estimates
  </span>
);

// --- Card ---------------------------------------------------------------------
// Plain element with a CSS entrance animation. Visibility never depends on JS
// animation completing, so content is always shown.
export const Card = ({ children, className = '', as: As = 'div', ...rest }) => (
  <As className={`glass card-in rounded-2xl shadow-glow ${className}`} {...rest}>
    {children}
  </As>
);

// --- Section header -----------------------------------------------------------
export const PageHeader = ({ title, subtitle, icon: Icon, right }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="rounded-xl bg-gradient-blue p-3 text-white shadow-light-glow">
          <Icon size={24} />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">{right}<SimBadge /></div>
  </div>
);

// --- KPI card -----------------------------------------------------------------
export const Kpi = ({ label, value, sub, icon: Icon, trend, accent = 'navy', onClick }) => {
  const accents = {
    navy: 'from-blue-600/15 to-blue-700/5 text-blue-600 dark:text-blue-300',
    saffron: 'from-blue-500/15 to-blue-500/5 text-blue-500',
    skyblue: 'from-cyan-500/15 to-cyan-500/5 text-cyan-500',
    green: 'from-emerald-500/15 to-emerald-500/5 text-emerald-500',
    gold: 'from-cyan-400/15 to-cyan-400/5 text-cyan-500',
    red: 'from-red-500/15 to-red-500/5 text-red-500',
  };
  return (
    <Card className={`p-4 hover:shadow-light-glow transition ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}>
      <div onClick={onClick} className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {sub && (
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-slate-500'}`}>
              {trend > 0 ? <TrendingUp size={13} /> : trend < 0 ? <TrendingDown size={13} /> : null}{sub}
            </p>
          )}
        </div>
        {Icon && <div className={`rounded-xl bg-gradient-to-br p-2.5 ${accents[accent]}`}><Icon size={20} /></div>}
      </div>
    </Card>
  );
};

// --- Donut score gauge --------------------------------------------------------
export const ScoreGauge = ({ score, size = 120, label, color }) => {
  const c = color || scoreColor(score), R = size / 2 - 10, circ = 2 * Math.PI * R;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-white/10" />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={c} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }} transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-3xl font-extrabold" style={{ color: c }}>{score}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label || 'Score'}</div>
      </div>
    </div>
  );
};

// --- Trust bar ----------------------------------------------------------------
const TRUST = [
  { icon: Brain, label: 'Human-in-the-loop' },
  { icon: Database, label: 'DPDP-aware' },
  { icon: Lock, label: 'Role-based access' },
  { icon: ScrollText, label: 'Audit-ready' },
  { icon: ShieldCheck, label: 'Explainable AI' },
  { icon: Server, label: 'Govt-controlled deployment' },
];
export const TrustBar = () => (
  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
    <span className="font-semibold text-slate-500">Trust & Compliance:</span>
    {TRUST.map(({ icon: I, label }) => (
      <span key={label} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300">
        <I size={12} />{label}
      </span>
    ))}
  </div>
);

// --- States: skeleton / empty / error ----------------------------------------
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-300/40 dark:bg-white/5 ${className}`} />
);
export const SkeletonGrid = ({ count = 4, h = 'h-24' }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className={h} />)}
  </div>
);
export const EmptyState = ({ msg = 'No data matches the current filters.' }) => (
  <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
    <Inbox size={36} /><p className="text-sm">{msg}</p>
  </Card>
);
export const ErrorState = ({ msg }) => (
  <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center text-red-400">
    <AlertTriangle size={36} /><p className="text-sm font-medium">Unable to render data</p>
    <p className="text-xs text-slate-400">{msg}</p>
  </Card>
);

// --- Modal --------------------------------------------------------------------
export const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          className="glass max-h-[85vh] w-full overflow-y-auto rounded-t-2xl p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-500/10"><X size={18} /></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Data table (searchable, sortable, exportable, mobile→cards) --------------
export const DataTable = ({ columns, rows, searchKeys = [], onRowClick, title }) => {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 1 });

  const filtered = useMemo(() => {
    let out = rows;
    if (q) {
      const t = q.toLowerCase();
      out = out.filter((row) => (searchKeys.length ? searchKeys : columns.map((c) => c.key))
        .some((k) => String(row[k] ?? '').toLowerCase().includes(t)));
    }
    if (sort.key) {
      out = [...out].sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir;
      });
    }
    return out;
  }, [rows, q, sort, columns, searchKeys]);

  const toSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));

  const exportCSV = () => {
    const head = columns.map((c) => c.label).join(',');
    const body = filtered.map((row) => columns.map((c) => `"${row[c.key] ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([`${head}\n${body}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${(title || 'export').replace(/\s+/g, '_')}.csv`; a.click();
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-slate-200/60 p-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {title && <h3 className="text-sm font-bold">{title}</h3>}
          <span className="text-xs text-slate-400">({filtered.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="w-full rounded-lg border border-slate-200/70 bg-white/60 py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-saffron/40 dark:border-white/10 dark:bg-white/5 sm:w-44" />
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-1 rounded-lg bg-navy-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700">
            <Download size={14} />Export
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">No matching rows.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/60 text-xs uppercase text-slate-500 dark:bg-white/5">
                <tr>{columns.map((c) => (
                  <th key={c.key} className="cursor-pointer select-none px-4 py-2.5 font-semibold" onClick={() => toSort(c.key)}>
                    <span className="inline-flex items-center gap-1">{c.label}<ArrowUpDown size={11} className="opacity-40" /></span>
                  </th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} onClick={() => onRowClick?.(row)}
                    className={`border-t border-slate-200/50 dark:border-white/5 ${onRowClick ? 'cursor-pointer hover:bg-saffron/5' : ''}`}>
                    {columns.map((c) => <td key={c.key} className="px-4 py-2.5">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="space-y-2 p-3 md:hidden">
            {filtered.map((row, i) => (
              <div key={i} onClick={() => onRowClick?.(row)}
                className="rounded-xl border border-slate-200/60 bg-white/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                {columns.map((c) => (
                  <div key={c.key} className="flex justify-between gap-3 py-0.5 text-sm">
                    <span className="text-xs text-slate-400">{c.label}</span>
                    <span className="text-right font-medium">{c.render ? c.render(row[c.key], row) : row[c.key]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};
