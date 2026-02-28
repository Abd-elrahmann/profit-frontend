import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notifications as NotificationsIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
const NavbarNotifications = ({
  notifications,
  count,
  shouldShake,
  showNotifications,
  setShowNotifications,
  onApproveJournal,
  approvingId,
  canPostJournals,
}) => {
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowNotifications]);
  const handleNotificationClick = (link) => {
    setShowNotifications(false);
    navigate(link);
  };
  return (
    <div className="relative" ref={notificationsRef}>
      <button
        type="button"
        onClick={() => setShowNotifications((v) => !v)}
        className={`relative p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ${shouldShake ? 'animate-bell-ring' : ''}`}
        aria-label="الإشعارات"
      >
        <NotificationsIcon sx={{ fontSize: 26, color: 'inherit' }} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 mt-2 w-80 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[1200] max-h-[85vh] overflow-hidden md:absolute md:top-full md:left-0 md:translate-x-0 md:mt-2">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">الإشعارات</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {count > 0 ? `${count} قيد يحتاج اعتماد` : 'لا توجد إشعارات جديدة'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationClick('/journal-entries')}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
            >
              الذهاب للقيود
            </button>
          </div>
          <div className="py-2 overflow-y-auto max-h-[60vh] min-h-0">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                لا توجد قيود تحتاج اعتماد
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(n.link)}
                  >
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{n.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.detail}</p>
                  </div>
                  {canPostJournals && (
                    <button
                      type="button"
                      onClick={(e) => onApproveJournal(n.journalId, e)}
                      disabled={approvingId === n.journalId}
                      className="shrink-0 p-2 rounded-lg text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="اعتماد القيد"
                      aria-label="اعتماد القيد"
                    >
                      {approvingId === n.journalId ? (
                        <div className="size-[22px] rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      ) : (
                        <CheckCircleIcon sx={{ fontSize: 22 }} />
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NavbarNotifications;