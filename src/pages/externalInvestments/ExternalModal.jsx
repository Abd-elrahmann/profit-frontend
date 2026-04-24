import React, { useEffect } from 'react';

/**
 * نافذة منبثقة بسيطة بـ Tailwind (بدون MUI)
 */
export default function ExternalModal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClass = 'max-w-lg',
  disableBackdropClose = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !disableBackdropClose) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, disableBackdropClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4" dir="rtl">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] cursor-default"
        onClick={() => {
          if (!disableBackdropClose) onClose?.();
        }}
        role="presentation"
      />
      <div
        className={`relative z-10 w-full ${maxWidthClass} rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {title ? (
          <h2 className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white shrink-0">
            {title}
          </h2>
        ) : null}
        <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0">{children}</div>
        {footer ? (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-end gap-2 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
