// Tiny fetch wrapper + React hook for the governance API.
import { useEffect, useState } from 'react';

const BASE = '/api';

export async function getJSON(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v && v !== '' && !['period', 'financialYear'].includes(v)),
  ).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`API ${path} failed (${res.status})`);
  return res.json();
}

// useApi(path, params) -> { data, meta, loading, error }
// Auto-refreshes every 30s for a live, real-time dashboard feel.
const REFRESH_MS = 30000;
export function useApi(path, params = {}) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const key = JSON.stringify(params);
  useEffect(() => {
    let alive = true;
    const load = (initial) => {
      if (initial) setState((s) => ({ ...s, loading: true, error: null }));
      getJSON(path, params)
        .then((json) => alive && setState({ data: json.data, meta: json._meta, loading: false, error: null }))
        .catch((e) => alive && setState((s) => ({ ...s, loading: false, error: e.message })));
    };
    load(true);
    const id = setInterval(() => load(false), REFRESH_MS);
    return () => { alive = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);
  return state;
}

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const inrCr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN') + ' Cr';
export const compact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return (v / 1e7).toFixed(2) + ' Cr';
  if (v >= 1e5) return (v / 1e5).toFixed(2) + ' L';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return String(v);
};
