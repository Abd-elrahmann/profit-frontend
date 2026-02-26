import React, { useState } from 'react';
import TableLayout from '../layouts/tableLayout';

/**
 * Responsive table: shows TableLayout on lg screens, cards on mobile/tablet
 * columns: [{ id, label, format?, render? }]
 * data: array of row objects
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  emptyMessage = 'لا يوجد بيانات',
  isLoading = false,
  keyField = 'id',
  cardClassName = '',
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tableLayoutColumns = columns.map((col) => ({
    id: col.id,
    label: col.label,
    arLabel: col.label,
    align: 'center',
    format: col.render || col.format || ((v) => v),
  }));

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop (lg+): TableLayout */}
      <div className="hidden lg:block">
        <TableLayout
          columns={tableLayoutColumns}
          data={paginatedData}
          isLoading={false}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          totalCount={data.length}
          emptyMessage={emptyMessage}
          maxHeight={400}
        />
      </div>

      {/* Mobile/Tablet: Cards */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {data.map((row, idx) => (
          <div
            key={row[keyField] ?? idx}
            className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-sm overflow-hidden ${cardClassName}`}
          >
            {columns.map((col) => {
              const value = row[col.id];
              const content = col.render
                ? col.render(value, row)
                : col.format
                ? col.format(value, row)
                : value;
              return (
                <div
                  key={col.id}
                  className="flex justify-between items-start py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0 first:pt-0"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {col.label}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-left max-w-[60%]">
                    {content}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;
