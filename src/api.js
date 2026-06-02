// In-app data hook — no backend. Data is generated client-side in data/mock.js.
import { useEffect, useState } from 'react';
import { getData } from './data/mock.js';

// useApi(path, params) -> { data, meta, loading, error }
// Auto-refreshes every 30s for a live, real-time dashboard feel.
const REFRESH_MS = 30000;
export function useApi(path, params = {}) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const key = JSON.stringify(params);
  useEffect(() => {
    let alive = true;
    const load = () => {
      try {
        const { data, _meta } = getData(path, params);
        if (alive) setState({ data, meta: _meta, loading: false, error: null });
      } catch (e) {
        if (alive) setState({ data: null, meta: null, loading: false, error: e.message });
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
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
