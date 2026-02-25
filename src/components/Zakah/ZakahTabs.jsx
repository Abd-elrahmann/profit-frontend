import React from 'react';

const ZakahTabs = ({ activeTab, onTabChange, selectedPartner, isCompact = false }) => (
  <div className={`border-b border-primary/10 mb-6 ${isCompact ? 'overflow-x-auto' : ''}`}>
    <nav className={`flex gap-1 ${isCompact ? 'min-w-max p-1' : ''}`} role="tablist">
      <button
        role="tab"
        aria-selected={activeTab === 0}
        onClick={() => onTabChange(0)}
        className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
          activeTab === 0
            ? 'text-primary border-primary'
            : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary'
        }`}
      >
        عرض جميع الزكاة
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 1}
        onClick={() => onTabChange(1)}
        className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
          activeTab === 1
            ? 'text-primary border-primary'
            : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary'
        }`}
      >
        {selectedPartner ? 'تفاصيل الزكاة' : 'زكاة محددة'}
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 2}
        onClick={() => onTabChange(2)}
        className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
          activeTab === 2
            ? 'text-primary border-primary'
            : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary'
        }`}
      >
        صندوق الزكاة
      </button>
    </nav>
  </div>
);

export default ZakahTabs;
