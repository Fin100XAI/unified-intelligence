// Theme-aware Recharts wrappers. Every chart is responsive + has tooltips.
import { useRef, useState, useLayoutEffect, cloneElement } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Card } from './ui.jsx';

// Reliable responsive wrapper: measures its own width and always passes a
// positive width/height to the chart (recharts renders nothing on a 0 size).
export function Responsive({ height = 280, children }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth || el.offsetWidth || 0);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  // Fallback width keeps charts visible before/if measurement returns 0.
  const width = w || (typeof window !== 'undefined' ? Math.min(window.innerWidth - 64, 760) : 600);
  return (
    <div ref={ref} style={{ width: '100%', height }}>
      {cloneElement(children, { width, height })}
    </div>
  );
}

// Google brand colors — ordered for best chart combinations
export const PALETTE = [
  '#4285F4', // Google Blue      — primary / positive
  '#EA4335', // Google Red       — risk / breach / danger
  '#FBBC05', // Google Yellow    — secondary / pending / comparison
  '#1A73E8', // Google Dark Blue — 4th series if needed
  '#FF6D00', // Material Orange  — 5th
  '#00BCD4', // Material Cyan    — 6th
  '#9C27B0', // Material Purple  — 7th
  '#00897B', // Material Teal    — 8th
];

const grid = 'rgba(120,130,160,0.12)';
const tip = {
  contentStyle: {
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: 10, color: '#1e293b', fontSize: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  cursor: { fill: 'rgba(66,133,244,0.06)' },
};

export const ChartCard = ({ title, subtitle, children, right, height = 280, className = '' }) => (
  <Card className={`p-4 ${className}`}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
    <Responsive height={height}>{children}</Responsive>
  </Card>
);

export const AreaTrend = ({ data, x, y, color = '#4285F4', ...dim }) => (
  <AreaChart {...dim} data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
    <defs>
      <linearGradient id={`g-${y}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
    <XAxis dataKey={x} tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <Tooltip {...tip} />
    <Area type="monotone" dataKey={y} stroke={color} strokeWidth={2.5} fill={`url(#g-${y})`} />
  </AreaChart>
);

export const Bars = ({ data, x, bars, vertical, ...dim }) => (
  <BarChart {...dim} data={data} layout={vertical ? 'vertical' : 'horizontal'} margin={{ top: 5, right: 12, left: vertical ? 30 : -18, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
    {vertical ? (
      <>
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis type="category" dataKey={x} width={120} tick={{ fontSize: 10, fill: '#94a3b8' }} />
      </>
    ) : (
      <>
        <XAxis dataKey={x} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
      </>
    )}
    <Tooltip {...tip} />
    {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
    {bars.map((b, i) => <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color || PALETTE[i]} radius={[6, 6, 0, 0]} />)}
  </BarChart>
);

export const Lines = ({ data, x, lines, ...dim }) => (
  <LineChart {...dim} data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
    <XAxis dataKey={x} tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 11 }} />
    {lines.map((l, i) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color || PALETTE[i]} strokeWidth={2.5} dot={false} />)}
  </LineChart>
);

export const Donut = ({ data, nameKey = 'name', valueKey = 'value', ...dim }) => (
  <PieChart {...dim}>
    <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="55%" outerRadius="80%" paddingAngle={3}>
      {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
    </Pie>
    <Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 11 }} />
  </PieChart>
);

export const RadarChartView = ({ data, dataKey = 'value', angleKey = 'subject', color = '#4285F4', ...dim }) => (
  <RadarChart {...dim} data={data} cx="50%" cy="50%" outerRadius="75%">
    <PolarGrid stroke={grid} />
    <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
    <Radar dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.45} />
    <Tooltip {...tip} />
  </RadarChart>
);
