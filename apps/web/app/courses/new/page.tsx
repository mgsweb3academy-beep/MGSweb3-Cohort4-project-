'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'ui';
import Link from 'next/link';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        router.push('/courses');
        router.refresh();
      } else {
        alert('Failed to create course.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create course. Ensure API is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="wrap py-12 rise">
      <div className="mb-8">
        <Link href="/courses" className="text-dim hover:text-chalk mb-4 inline-block">&larr; Back to Courses</Link>
        <h1 className="text-4xl font-display font-bold">Create New Course</h1>
        <p className="text-dim mt-2">Enter the initial details for your new course.</p>
      </div>

      <div className="card max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-chalk mb-2">
              Course Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-ink border border-line rounded-lg px-4 py-2 text-chalk focus:outline-none focus:border-signal transition-colors"
              placeholder="e.g. Introduction to ZK Proofs"
              required
            />
          </div>

          <div className="pt-4 border-t border-line flex justify-end gap-3">
            <Link href="/courses">
              <Button type="button">Cancel</Button>
            </Link>
            <Button type="submit" variant="solid" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
