import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { getAccounts } from '../../pages/generalLedger/generalLedgerApi';
import { AccountTree, Search, ImportExport, PictureAsPdf, TableChart } from '@mui/icons-material';
const GeneralLedgerFilters = ({
  account,
  fromDate,
  toDate,
  onAccountChange,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onExportPDF,
  onExportExcel,
  hasExportPermission,
  exportLoading,
  hasLedgerData,
}) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAccounts(1, inputValue);
        if (!cancelled) setAccounts(data.accounts || []);
      } catch {
        if (!cancelled) setAccounts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [inputValue]);
  const handleSearch = () => {
    if (account) onSearch?.();
  };
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">اختار الحساب</label>
          <Autocomplete
            value={account}
            onChange={(_, v) => onAccountChange?.(v)}
            inputValue={inputValue}
            onInputChange={(_, v) => setInputValue(v)}
            options={accounts}
            getOptionLabel={(opt) => (opt ? `${opt.code} - ${opt.name}` : '')}
            loading={loading}
            noOptionsText="لا توجد حسابات"
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="ابحث عن الحساب في دليل الحسابات..."
                size="small"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <AccountTree sx={{ fontSize: 20, color: '#94a3b8', ml: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    borderRadius: '0.5rem',
                  },
                }}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">من تاريخ</label>
          <DatePicker
            value={fromDate ? dayjs(fromDate) : null}
            onChange={(v) => onFromDateChange?.(v ? v.format('YYYY-MM-DD') : null)}
            maxDate={toDate ? dayjs(toDate) : dayjs()}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgb(248 250 252)',
                    borderRadius: '0.5rem',
                  },
                },
              },
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">إلى تاريخ</label>
          <DatePicker
            value={toDate ? dayjs(toDate) : null}
            onChange={(v) => onToDateChange?.(v ? v.format('YYYY-MM-DD') : null)}
            minDate={fromDate ? dayjs(fromDate) : null}
            maxDate={dayjs()}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgb(248 250 252)',
                    borderRadius: '0.5rem',
                  },
                },
              },
            }}
          />
        </div>
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={handleSearch}
            disabled={!account}
            className="flex-1 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Search sx={{ fontSize: 20 }} />
            بحث
          </button>
          {hasExportPermission && (
            <div className="relative group">
              <button
                type="button"
                disabled={!hasLedgerData || exportLoading?.pdf || exportLoading?.excel}
                className="h-[40px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ImportExport sx={{ fontSize: 20 }} />
                تصدير
              </button>
              <div className="hidden group-hover:block absolute left-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-20">
                <button
                  type="button"
                  onClick={onExportPDF}
                  disabled={exportLoading?.pdf}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <PictureAsPdf sx={{ fontSize: 20, color: '#dc2626' }} />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={onExportExcel}
                  disabled={exportLoading?.excel}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-b-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <TableChart sx={{ fontSize: 20, color: '#16a34a' }} />
                  Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default React.memo(GeneralLedgerFilters);