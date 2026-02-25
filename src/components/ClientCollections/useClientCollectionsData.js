import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '../../pages/clientCollections/clientsCollectionsApi';

const PAGE = 1;
const LIMIT = 20;

export const useClientCollectionsData = (clientsTab) => {
  const { data: activeData, isLoading: isActiveLoading } = useQuery({
    queryKey: ['clients-collections', PAGE, 'ACTIVE'],
    queryFn: () => getAllClients(PAGE, LIMIT, 'ACTIVE'),
    enabled: clientsTab === 0,
  });

  const { data: completedData, isLoading: isCompletedLoading } = useQuery({
    queryKey: ['clients-collections', PAGE, 'COMPLETE'],
    queryFn: () => getAllClients(PAGE, LIMIT, 'COMPLETE'),
    enabled: clientsTab === 1,
  });

  const data = clientsTab === 0 ? activeData : completedData;
  const isLoading = clientsTab === 0 ? isActiveLoading : isCompletedLoading;

  return { data, isLoading };
};
