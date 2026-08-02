"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from 'ui';

function getRoleRedirect(role: string) {
  if (role === 'admin') return '/admin';
  if (role === 'instructor') return '/instructor';
  return '/dashboard';
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || 'Failed to register');
      }

      // After successful registration, log the user in
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboard',
      });

      if (signInRes?.error) {
        throw new Error('Auto-login failed after registration');
      } else if (signInRes?.url) {
        await fetch('/api/v1/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        setSuccess('Account created. A verification token was issued for your onboarding step.');
        router.push(signInRes.url || getRoleRedirect('student'));
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-[var(--chalk)] p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[var(--ink-2)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-[var(--dim)] mt-2">Join Corridor to access your cohort.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--dim)]">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Doe"
              disabled={isLoading}
            />
          </div>
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
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--line)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--ink-2)] text-[var(--dim)]">Or register with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            Google
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
