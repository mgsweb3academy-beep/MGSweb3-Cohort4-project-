"use client";

import { signIn } from 'next-auth/react';
import { Card, Button } from 'ui';

// Sign-up is GitHub-only for now; Google is shown as coming soon.
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-[var(--chalk)] p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[var(--ink-2)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-[var(--dim)] mt-2">Join Corridor with your GitHub account to access your cohort.</p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="solid"
            className="w-full"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          >
            Sign up with GitHub
          </Button>
          <Button type="button" variant="outline" className="w-full" disabled>
            Google (coming soon)
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--dim)]">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--signal)] hover:underline">
            Sign in
          </a>
        </p>
      </Card>
    </div>
  );
}
