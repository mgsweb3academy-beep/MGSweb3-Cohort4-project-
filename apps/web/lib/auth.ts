import { useSession as useNextAuthSession } from 'next-auth/react';
import type { UserRole } from 'types';

export function useSession() {
  const { data, status } = useNextAuthSession();
  
  return {
    user: data?.user,
    role: (data?.user as any)?.role as UserRole | undefined,
    status
  };
}
