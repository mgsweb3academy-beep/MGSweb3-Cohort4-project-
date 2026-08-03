import * as React from 'react';
import { Thread, Post } from 'types';
import { PostItem } from './PostItem';

export const ThreadView = ({
  thread,
  posts,
  onFlag,
  onSubmitPost,
  onBack
}: {
  thread: Thread;
  posts: Post[];
  onFlag: (id: string) => void;
  onSubmitPost: (content: string) => void;
  onBack: () => void;
}) => {
  const [content, setContent] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmitPost(content);
    setContent('');
  };

  return (
    <div>
      <button 
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--dim)',
          cursor: 'pointer',
          marginBottom: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem'
        }}
      >
        ← Back to Discussions
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--chalk)', margin: '0 0 8px 0' }}>
          {thread.title}
        </h2>
        <div style={{ color: 'var(--dim)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          Started by {thread.authorName} on {new Date(thread.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {posts.map((post) => (
          <PostItem key={post.id} post={post} onFlag={onFlag} />
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply... (Add a '?' to ask the AI Tutor)"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--ink-2)',
            border: '1px solid var(--line)',
            color: 'var(--chalk)',
            borderRadius: '4px',
            fontFamily: 'var(--font-body)',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={!content.trim()}
            style={{
              padding: '8px 16px',
              background: content.trim() ? 'var(--chalk)' : 'var(--ink-3)',
              color: 'var(--ink)',
              border: 'none',
              borderRadius: '4px',
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600
            }}
          >
            Post Reply
          </button>
        </div>
      </form>
    </div>
  );
};
