'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Task, TaskReview } from '@/lib/types';

interface ReviewSectionProps {
  task: Task;
  currentUser: { id: string; name: string };
}

export function ReviewSection({ task, currentUser }: ReviewSectionProps) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviews = task.reviews || [];
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;

  const handleSubmit = async (status: 'approved' | 'changes_requested') => {
    if (!comment.trim()) {
      setError('Please provide a review comment.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/tasks/${task.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          status,
          comment,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body?.error?.message ?? 'Failed to submit review.');
        return;
      }

      setComment('');
      // Force a hard navigation to refresh the page state so the parent component fetches the new task data
      router.refresh();
      window.location.reload();
    } catch (err) {
      setError((err as Error).message ?? 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mt-[2rem]">
      <div className="flex items-center justify-between mb-[1rem]">
        <h3 className="font-display font-bold text-[1.2rem]">Peer Reviews</h3>
        <div className="flex gap-[.5rem]">
          {/* Mock GitHub Diff Link */}
          <a
            href={`https://github.com/mgsweb3academy-beep/mock-repo/compare/main...task/${task.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline mono text-[.75rem]"
          >
            View Diff on GitHub ↗
          </a>
        </div>
      </div>

      <div className="text-[.875rem] text-dim mb-[1.5rem]">
        Task requires 2 approvals to be closed. Currently has {approvedCount}/2 approvals.
      </div>

      {reviews.length > 0 && (
        <div className="flex flex-col gap-[1rem] mb-[2rem]">
          {reviews.map((r) => (
            <div key={r.id} className="p-[1rem] bg-ink-2 rounded-[8px] border border-ink-3">
              <div className="flex items-center justify-between mb-[.5rem]">
                <div className="flex items-center gap-[.5rem]">
                  <span className="font-bold">{r.reviewerName}</span>
                  <span className={`pill ${r.status === 'approved' ? 'pill-green' : 'pill-yellow'}`}>
                    {r.status === 'approved' ? 'Approved' : 'Requested Changes'}
                  </span>
                </div>
                <span className="mono text-[.75rem] text-dim">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-chalk whitespace-pre-wrap leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {task.state === 'In Review' && (
        <div className="flex flex-col gap-[1rem] bg-ink-2 p-[1.5rem] rounded-[8px] border border-ink-3">
          <h4 className="font-bold">Leave a Review</h4>
          
          {error && <div className="text-mark text-[.875rem]">{error}</div>}
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave your review comments here..."
            className="input font-body min-h-[100px] resize-y"
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-end gap-[1rem] mt-[.5rem]">
            <button
              className="btn text-yellow-500 hover:text-yellow-400 disabled:opacity-50"
              onClick={() => handleSubmit('changes_requested')}
              disabled={isSubmitting}
            >
              Request Changes
            </button>
            <button
              className="btn btn-solid"
              onClick={() => handleSubmit('approved')}
              disabled={isSubmitting}
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
