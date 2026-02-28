import React from 'react';
import dayjs from 'dayjs';
import { OpenInNew } from '@mui/icons-material';
import 'dayjs/locale/ar';
const formatDate = (date) => dayjs(date).locale('ar').format('YYYY-MM-DD');
const GeneralLedgerTable = ({ journals = [], totalDebit = 0, totalCredit = 0, closingBalance = 0 }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-primary/5 dark:bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border-y border-primary/10">
            <th className="px-6 py-4">التاريخ</th>
            <th className="px-6 py-4">رقم القيد</th>
            <th className="px-6 py-4">البيان</th>
            <th className="px-6 py-4 text-left">مدين</th>
            <th className="px-6 py-4 text-left">دائن</th>
            <th className="px-6 py-4 text-left">الرصيد المتراكم</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {journals?.map((journal) =>
            journal.lines?.map((line) => (
              <tr
                key={`${journal.id}-${line.id}`}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {formatDate(journal.date)}
                </td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    className="text-primary font-bold hover:underline flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    {journal.reference}
                    <OpenInNew sx={{ fontSize: 14 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {line.description}
                  {journal.postedBy && (
                    <span className="block text-xs text-slate-500 mt-0.5">بواسطة: {journal.postedBy}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-left">
                  <span className={line.debit > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                    {(line.debit || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-left">
                  <span className={line.credit > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}>
                    {(line.credit || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100 text-left">
                  {(line.balance ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 dark:bg-slate-800 font-extrabold border-t-2 border-slate-200 dark:border-slate-600">
            <td className="px-6 py-4 text-slate-800 dark:text-slate-200 text-base text-center" colSpan={3}>
              الإجمالي الكلي للفترة
            </td>
            <td className="px-6 py-4 text-primary text-left">
              {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td className="px-6 py-4 text-red-600 dark:text-red-400 text-left">
              {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td className="px-6 py-4 text-slate-900 dark:text-slate-100 text-left">
              {closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
);
export default React.memo(GeneralLedgerTable);