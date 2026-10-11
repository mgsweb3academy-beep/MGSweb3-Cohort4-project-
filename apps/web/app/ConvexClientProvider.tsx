 'use client';

import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useCallback, type ReactNode } from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || 'https://dummy.convex.cloud');

function useConvexSession() {
  const { data, status } = useSession();
  const email = data?.user?.email;
  const fetchAccessToken = useCallback(async () => {
    if (!email) return null;
    const response = await fetch('/api/convex-token', { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()).token as string;
  }, [email]);
  return { isLoading: status === 'loading', isAuthenticated: status === 'authenticated', fetchAccessToken };
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <SessionProvider><ConvexProviderWithAuth client={convex} useAuth={useConvexSession}>{children}</ConvexProviderWithAuth></SessionProvider>;
}
