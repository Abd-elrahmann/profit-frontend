import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import Api from '../../config/Api';

export default function Settings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoPost, setAutoPost] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/api/settings');
      const data = response.data;
      setAutoPost(data?.autoPost ?? false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      notifyError('حدث خطأ في تحميل الإعدادات');
      setAutoPost(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await Api.post('/api/settings', { autoPost });
      notifySuccess('تم حفظ الإعدادات بنجاح');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full max-w-full flex-col overflow-x-hidden dark:bg-[#141e16]">
        <div className="flex flex-1 justify-center items-center min-h-[60vh] w-full bg-[#f6f8f6] dark:bg-[#141e16]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-full flex-col overflow-x-hidden dark:bg-[#141e16]">
      <Helmet>
        <title>الإعدادات</title>
        <meta name="description" content="إعدادات النظام" />
      </Helmet>

      <main className="w-full max-w-full flex-1 py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 bg-[#f6f8f6] dark:bg-[#141e16] overflow-x-hidden">
        <div className="w-full max-w-2xl mx-auto min-w-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
              الإعدادات
            </h1>
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            إدارة إعدادات النظام والمحاسبة
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none overflow-hidden">
          {/* Section header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              إعدادات المحاسبة
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              التحكم في طريقة اعتماد القيود اليومية
            </p>
          </div>

          {/* Toggle row */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/30">
              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  اعتماد القيود تلقائياً
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {autoPost
                    ? 'القيود تُعتمد تلقائياً عند إنشائها'
                    : 'القيود تحتاج اعتماد يدوي من المستخدم'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoPost}
                onClick={() => setAutoPost(!autoPost)}
                className={`
                  relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  dark:focus:ring-offset-slate-900
                  ${autoPost ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow ring-0
                    transition-all duration-200 ease-in-out
                    ${autoPost ? 'ms-6' : 'ms-0.5'}
                  `}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-slate-200 dark:border-slate-700/50" />

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="
                inline-flex items-center justify-center gap-2 px-6 py-3
                bg-primary hover:bg-primary/90 disabled:bg-primary/60
                text-white font-semibold rounded-xl
                shadow-sm hover:shadow-md
                transition-all duration-200 ease-out
                disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  حفظ الإعدادات
                </>
              )}
            </button>
          </div>
        </div>

        {/* Future section placeholder - subtle hint for extensibility */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          المزيد من الخيارات ستُضاف قريباً
        </p>
        </div>
      </main>
    </div>
  );
}
