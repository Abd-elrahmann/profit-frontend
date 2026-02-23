import React, { createContext, useContext, useState, useCallback } from 'react';

const FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'monthly', label: 'شهري' },
  { value: 'yearly', label: 'سنوي' },
  { value: 'custom', label: 'مخصص' },
];

const DashboardFilterContext = createContext(null);

export const DashboardFilterProvider = ({ children }) => {
  const [filter, setFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [tabTitle, setTabTitle] = useState('لوحة التحكم');

  const getApiFilter = useCallback(() => {
    if (filter === 'all') return 'all';
    if (filter === 'custom' && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    return filter;
  }, [filter, customFrom, customTo]);

  const value = {
    filter,
    setFilter,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    tabTitle,
    setTabTitle,
    FILTER_OPTIONS,
    getApiFilter,
    isCustom: filter === 'custom',
  };

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
};

export const useDashboardFilter = () => {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error('useDashboardFilter must be used within DashboardFilterProvider');
  return ctx;
};
