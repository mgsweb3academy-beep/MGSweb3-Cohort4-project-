"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Card, Button } from 'ui';

export default function InvitePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const code = params.code as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If unauthenticated, redirect to login with callback
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  const handleAcceptInvite = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/v1/invites/${code}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to accept invite');
      }
      
      setSuccess(true);
      // Give them a moment to see the success state before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-[var(--chalk)]">
        <p className="text-[var(--dim)] animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-[var(--chalk)] p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6 bg-[var(--ink-2)]">
        <h1 className="text-2xl font-bold tracking-tight">You've been invited!</h1>
        
        {success ? (
          <div className="space-y-4">
            <div className="text-[var(--signal)]">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Invite accepted successfully!</p>
            </div>
            <p className="text-[var(--dim)] text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            <p className="text-[var(--dim)]">
              Join Cohort using the invite code <span className="font-mono text-[var(--chalk)]">{code}</span>.
            </p>
            
            {error && <div className="text-[var(--mark)] text-sm">{error}</div>}

            <Button 
              onClick={handleAcceptInvite} 
              variant="solid" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Accepting...' : 'Accept Invite & Join Cohort'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
