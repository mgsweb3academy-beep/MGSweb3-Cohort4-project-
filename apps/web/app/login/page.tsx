"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Input } from 'ui';

function getRoleRedirect(role: string) {
  if (role === 'admin') return '/admin';
  if (role === 'instructor') return '/instructor';
  return '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    } else if (res?.url) {
      setSuccess('Signed in successfully.');
      router.push(res.url || getRoleRedirect('student'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-[var(--chalk)] p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[var(--ink-2)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Corridor</h1>
          <p className="text-[var(--dim)] mt-2">Enter your details to access your cohort.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--dim)]">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--dim)]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-[var(--mark)] text-sm">{error}</div>}
          {success && <div className="text-[var(--signal)] text-sm">{success}</div>}

          <Button type="submit" variant="solid" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--line)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--ink-2)] text-[var(--dim)]">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn('github', { callbackUrl })}
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl })}
          >
            Google
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--dim)]">
          Don't have an account?{' '}
          <a href="/register" className="text-[var(--signal)] hover:underline">
            Register here
          </a>
        </p>
      </Card>
    </div>
  );
}
