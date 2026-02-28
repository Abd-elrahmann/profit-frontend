import React from 'react';
import { Settings as SettingsIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
const ProfilePreferencesCard = ({ isDarkMode, onToggleTheme }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <SettingsIcon className="text-primary" sx={{ fontSize: 24 }} />
        <h3 className="font-bold text-lg">التفضيلات العامة</h3>
      </div>
      <div className="p-6 space-y-8">
        <div>
          <label className="font-bold text-sm block mb-4">وضع العرض (الثيم)</label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => isDarkMode && onToggleTheme()}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                !isDarkMode ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <LightModeIcon sx={{ fontSize: 20 }} />
              فاتح
            </button>
            <button
              type="button"
              onClick={() => !isDarkMode && onToggleTheme()}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                isDarkMode ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <DarkModeIcon sx={{ fontSize: 20 }} />
              داكن
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            الوضع الحالي هو {isDarkMode ? 'الداكن' : 'الفاتح'}، سيتم تطبيق الوضع تلقائياً بناءً على اختيارك.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ProfilePreferencesCard;