import React from 'react';
const ProfilePasswordModal = ({
  open,
  onClose,
  passwordForm,
  onFormChange,
  onSubmit,
  updating,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-6">تغيير كلمة المرور</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => onFormChange((p) => ({ ...p, oldPassword: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => onFormChange((p) => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => onFormChange((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">
              إلغاء
            </button>
            <button type="submit" disabled={updating} className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-70">
              {updating ? 'جاري التحديث...' : 'تحديث'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProfilePasswordModal;