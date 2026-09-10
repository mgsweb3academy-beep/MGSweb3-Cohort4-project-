'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://dummy.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </SessionProvider>
  );
}
