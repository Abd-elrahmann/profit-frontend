import React, { createContext, useContext, useMemo, useRef, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Api from '../../config/Api';
import { getJournals } from '../../pages/Journals/journalsApi';
import { postJournal } from '../../pages/Journals/journalsApi';
import { getJournalSourceTypeText } from '../Journals/journalsUtils';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const prevCountRef = useRef(0);
  const [shouldShake, setShouldShake] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await Api.get('/api/settings');
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  const autoPost = settingsData?.autoPost ?? false;

  const { data: unpostedJournalsData } = useQuery({
    queryKey: ['unposted-journals-all'],
    queryFn: () => getJournals(1, { status: 'DRAFT', limit: 100 }),
    enabled: !autoPost,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const notifications = useMemo(() => {
    const list = [];
    if (autoPost) return list;

    const journals = unpostedJournalsData?.journals || [];
    journals.forEach((j) => {
      const sourceText = getJournalSourceTypeText(j.sourceType);
      list.push({
        id: `journal-${j.id}`,
        journalId: j.id,
        reference: j.reference || `#${j.id}`,
        sourceType: j.sourceType,
        sourceTypeText: sourceText,
        message: `قيد ${j.reference || j.id} - ${sourceText}`,
        detail: j.description || 'يحتاج اعتماد',
        link: '/journal-entries',
      });
    });
    return list;
  }, [autoPost, unpostedJournalsData]);

  const count = notifications.length;

  useEffect(() => {
    if (count > prevCountRef.current) {
      setShouldShake(true);
      prevCountRef.current = count;
      const t = setTimeout(() => setShouldShake(false), 900);
      return () => clearTimeout(t);
    }
    prevCountRef.current = count;
  }, [count]);

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
    queryClient.invalidateQueries({ queryKey: ['journals'] });
    queryClient.invalidateQueries({ queryKey: ['unposted-loan-journals'] });
    queryClient.invalidateQueries({ queryKey: ['unposted-small-loan-journals'] });
    queryClient.invalidateQueries({ queryKey: ['opening-journals-check'] });
  };

  const handleApproveJournal = async (journalId, e) => {
    e?.stopPropagation?.();
    setApprovingId(journalId);
    try {
      await postJournal(journalId);
      notifySuccess('تم اعتماد القيد بنجاح');
      invalidateNotifications();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء اعتماد القيد');
    } finally {
      setApprovingId(null);
    }
  };

  const value = {
    notifications,
    count,
    shouldShake,
    autoPost,
    onApproveJournal: handleApproveJournal,
    approvingId: approvingId,
    invalidateNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};
