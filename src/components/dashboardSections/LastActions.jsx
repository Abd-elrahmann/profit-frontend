import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle,
  FileText,
  Users,
  PieChart,
  Filter,
  RefreshCw,
  ChevronDown,
  User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLastActions, getLastActionsStats } from '../../pages/dashboard/dashboardApi';

const LastActions = React.memo(() => {
  const [screenFilter, setScreenFilter] = useState('all');

  const { data: actions = [], isLoading, refetch } = useQuery({
    queryKey: ['last-actions', 10, screenFilter],
    queryFn: () => getLastActions(10, screenFilter === 'all' ? undefined : screenFilter),
  });

  const { data: stats } = useQuery({
    queryKey: ['last-actions-stats'],
    queryFn: getLastActionsStats,
  });

  const formatRelativeTime = (date) => {
    const now = new Date();
    const actionTime = new Date(date);
    const diffMs = now - actionTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return actionTime.toLocaleDateString('ar-SA');
  };

  const getActionConfig = (screen) => {
    const configs = {
      Loans: {
        icon: Wallet,
        bg: 'bg-primary',
        tag: 'تمويل شخصي',
        tagClass: 'bg-primary/10 text-primary',
      },
      Repayments: {
        icon: CheckCircle,
        bg: 'bg-emerald-500',
        tag: 'دفعة مكتملة',
        tagClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      },
      Journals: {
        icon: FileText,
        bg: 'bg-blue-500',
        tag: 'قيود',
        tagClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      },
      Partners: {
        icon: Users,
        bg: 'bg-amber-500',
        tag: 'شركاء',
        tagClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      },
      Distribution: {
        icon: PieChart,
        bg: 'bg-purple-500',
        tag: 'توزيع',
        tagClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      },
    };
    return configs[screen] || {
      icon: FileText,
      bg: 'bg-slate-500',
      tag: screen,
      tagClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };
  };

  const getScreenTitle = (screen) => {
    const map = {
      Loans: 'السلف والطلبات',
      Repayments: 'المدفوعات والتحصيل',
      Journals: 'القيود اليومية',
      Partners: 'العملاء والمسؤولين',
      Distribution: 'التوزيعات',
    };
    return map[screen] || screen;
  };

  const getActionLabelArabic = (action) => {
    const map = {
      CREATE: 'إنشاء',
      UPDATE: 'تعديل',
      DELETE: 'حذف',
      POST: 'ترحيل',
      UNPOST: 'إلغاء ترحيل',
      login: 'تسجيل دخول',
      logout: 'تسجيل خروج',
    };
    return map[action] || action;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[960px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight">
            آخر الأنشطة
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            تتبع العمليات المالية وسجل التحركات اليومي للموظفين والنظام
          </p>
        </div>
        <div className="flex gap-4">
          <label className="flex flex-col min-w-56">
            <span className="text-slate-700 dark:text-slate-200 text-sm font-bold mb-2">
              تصفية حسب نوع النشاط
            </span>
            <div className="relative">
              <select
                value={screenFilter}
                onChange={(e) => setScreenFilter(e.target.value)}
                className="w-full rounded-lg border border-primary/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 pr-10 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="all">جميع الأنشطة</option>
                <option value="loans">السلف والطلبات</option>
                <option value="payments">المدفوعات والتحصيل</option>
                <option value="journals">القيود اليومية</option>
                <option value="partners">العملاء والمسؤولين</option>
                <option value="distribution">التوزيعات</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
            </div>
          </label>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold self-end hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <RefreshCw className="size-5" />
            تحديث السجل
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute right-[19px] top-0 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700" />
        <div className="flex flex-col gap-8">
          {actions.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
                لا توجد أنشطة حديثة
              </h3>
              <p className="text-slate-500 text-sm">لم يتم تسجيل أي أنشطة في الوقت الحالي</p>
            </div>
          ) : (
            actions.map((action) => {
              const config = getActionConfig(action.screen);
              const Icon = config.icon;
              return (
                <div key={action.id} className="relative flex items-start gap-6 group">
                  <div
                    className={`relative z-10 size-10 rounded-full ${config.bg} flex items-center justify-center text-white shadow-md ring-4 ring-white dark:ring-[#141e16] shrink-0`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                        {getActionLabelArabic(action.action) || getScreenTitle(action.screen)}
                      </h3>
                      <span className="text-slate-400 text-sm font-medium shrink-0">
                        {formatRelativeTime(action.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-base mb-3">
                      {action.description || `نشاط في ${getScreenTitle(action.screen)}`}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <User className="size-3.5 text-primary" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        بواسطة:{' '}
                        <span className="text-primary font-bold">
                          {action.user?.name || 'النظام'}
                        </span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${config.tagClass}`}
                      >
                        {config.tag}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {actions.length > 0 && (
          <div className="mt-12 flex justify-center relative">
            <button
              type="button"
              className="bg-white dark:bg-slate-800 border border-primary/20 px-8 py-3 rounded-full text-primary font-bold hover:bg-primary/5 transition-colors flex items-center gap-2 z-10"
            >
              عرض المزيد من الأنشطة
              <ChevronDown className="size-5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="mt-16 bg-primary/5 rounded-2xl p-8 border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-primary text-3xl font-black">
              {stats?.todayCount ?? 0}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-sm">عملية اليوم</span>
          </div>
          <div className="flex flex-col gap-1 border-x border-primary/10">
            <span className="text-primary text-3xl font-black">
              {stats?.activeUsersToday ?? 0}
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-sm">موظف نشط</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-primary text-3xl font-black">98%</span>
            <span className="text-slate-600 dark:text-slate-300 text-sm">دقة المعاملات</span>
          </div>
        </div>
      </div>
    </div>
  );
});

LastActions.displayName = 'LastActions';

export default LastActions;
