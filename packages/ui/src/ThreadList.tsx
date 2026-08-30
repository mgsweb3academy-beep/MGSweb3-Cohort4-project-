import * as React from 'react';
import { Thread } from 'types';

export const ThreadList = ({
  threads,
  onSelectThread,
}: {
  threads: Thread[];
  onSelectThread: (id: string) => void;
}) => {
  if (threads.length === 0) {
    return <div style={{ color: 'var(--dim)', padding: '24px 0' }}>No discussions found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: 'var(--ink-2)',
            border: '1px solid var(--line)',
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--chalk)'
          }}
        >
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{thread.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--dim)' }}>
              Started by {thread.authorName}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--dim)' }}>
            <div>{thread.postCount} {thread.postCount === 1 ? 'POST' : 'POSTS'}</div>
            <div style={{ marginTop: '4px' }}>Updated {new Date(thread.updatedAt).toLocaleDateString()}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
