import { createContext, useContext, useMemo, useState } from 'react';

const FilterContext = createContext();
export const useFilters = () => useContext(FilterContext);

export const EMPTY = {
  division: '', district: '', department: '', scheme: '', risk: '',
  period: 'FY 2025-26', urbanRural: '', serviceCategory: '', financialYear: 'FY 2025-26', priority: '',
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(EMPTY);
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters(EMPTY);
  const activeCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v && !['period', 'financialYear'].includes(k)).length,
    [filters],
  );

  // Generic client-side row matcher used by every page for live reactivity.
  const matchRow = (row) => {
    if (filters.division && row.division && row.division !== filters.division) return false;
    if (filters.district && (row.district || row.name) && (row.district || row.name) !== filters.district) return false;
    if (filters.department && row.department && row.department !== filters.department) return false;
    if (filters.scheme && row.scheme && row.scheme !== filters.scheme) return false;
    if (filters.risk && (row.riskLevel || row.level || row.priority) &&
        ![row.riskLevel, row.level, row.priority].includes(filters.risk)) return false;
    if (filters.urbanRural && row.urbanRural && row.urbanRural !== filters.urbanRural) return false;
    if (filters.priority && row.priority && row.priority !== filters.priority) return false;
    return true;
  };

  return (
    <FilterContext.Provider value={{ filters, setFilter, setFilters, reset, activeCount, matchRow }}>
      {children}
    </FilterContext.Provider>
  );
}
