import { useQuery } from '@tanstack/react-query';
import { listGroupsForUser } from '@/lib/groups/group-service';
import { useAuthContext } from '@/context/AuthContext';

export const GROUPS_KEY = ['groups'] as const;

export function useGroups() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: [...GROUPS_KEY, user?.uid ?? 'anon'],
    queryFn: async () => {
      if (!user) return [];
      return listGroupsForUser(user.uid);
    },
    enabled: Boolean(user),
  });
}
