import * as React from 'react';
import { Post } from 'types';

export const PostItem = ({
  post,
  onFlag,
}: {
  post: Post;
  onFlag: (id: string) => void;
}) => {
  return (
    <div style={{
      padding: '16px',
      background: post.isAiAnswer ? 'var(--ink-3)' : 'var(--ink-2)',
      border: `1px solid ${post.isAiAnswer ? 'var(--signal)' : 'var(--line)'}`,
      borderRadius: '4px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: 'var(--chalk)' }}>{post.authorName}</strong>
          {post.isAiAnswer && (
            <span style={{ fontSize: '0.72rem', background: 'var(--signal)', color: 'var(--ink)', padding: '2px 6px', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}>
              AI TUTOR
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => onFlag(post.id)}
          title="Report this post"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--dim)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            textDecoration: 'underline'
          }}
        >
          Flag
        </button>
      </div>
      <div style={{ color: 'var(--chalk)', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {post.content}
      </div>
    </div>
  );
};
