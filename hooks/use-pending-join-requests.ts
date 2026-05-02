import { useQuery } from '@tanstack/react-query';

import { listPendingJoinRequestsForCreator } from '@/lib/groups/group-service';
import { useAuthContext } from '@/context/AuthContext';

export const PENDING_JOIN_REQUESTS_KEY = ['pendingJoinRequests'] as const;

export function usePendingJoinRequestsForCreator() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: [...PENDING_JOIN_REQUESTS_KEY, user?.uid ?? 'anon'],
    queryFn: async () => {
      if (!user) return [];
      return listPendingJoinRequestsForCreator(user.uid);
    },
    enabled: Boolean(user),
  });
}
