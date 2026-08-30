"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ThreadList, ThreadView } from 'ui';
import { Thread, Post } from 'types';

// Mock fetching data. In a real app, this would use SWR/React Query and fetch from the NestJS API
export default function DiscussionsPage() {
  const { id: cohortId } = useParams() as { id: string };
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API Call for threads
    setTimeout(() => {
      setThreads([
        {
          id: 'mock-thread-1',
          scopeType: 'cohort',
          scopeId: cohortId,
          title: 'Welcome to the cohort! Introduce yourselves',
          authorId: 'instructor-1',
          authorName: 'Instructor Alice',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          postCount: 0
        }
      ]);
      setLoading(false);
    }, 500);
  }, [cohortId]);

  useEffect(() => {
    if (selectedThreadId) {
      // Mock API call for posts
      setPosts([
        {
          id: 'mock-post-1',
          threadId: selectedThreadId,
          content: 'Hello everyone! Excited to be here.',
          authorId: 'student-1',
          authorName: 'Student Bob',
          isAiAnswer: false,
          isFlagged: false,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [selectedThreadId]);

  const handleFlag = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    alert('Post flagged and removed from view.');
    // In real app, call POST /posts/:postId/flag
  };

  const handleSubmitPost = (content: string) => {
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      threadId: selectedThreadId!,
      content,
      authorId: 'me',
      authorName: 'Current User',
      isAiAnswer: false,
      isFlagged: false,
      createdAt: new Date().toISOString()
    };
    setPosts([...posts, newPost]);
    // If it contains a question, mock AI response
    if (content.includes('?')) {
      setTimeout(() => {
        setPosts(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          threadId: selectedThreadId!,
          content: `This is an AI Tutor response to your question: "${content}"`,
          authorId: 'ai',
          authorName: 'AI Tutor',
          isAiAnswer: true,
          isFlagged: false,
          createdAt: new Date().toISOString()
        }]);
      }, 1000);
    }
  };

  if (loading) return <div style={{ color: 'var(--dim)', padding: '24px' }}>Loading discussions...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {!selectedThreadId ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--chalk)', margin: 0, fontSize: '2rem' }}>
              Cohort Discussions
            </h1>
            <button style={{
              background: 'var(--chalk)',
              color: 'var(--ink)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              New Thread
            </button>
          </div>
          <ThreadList threads={threads} onSelectThread={setSelectedThreadId} />
        </>
      ) : (
        <ThreadView 
          thread={threads.find(t => t.id === selectedThreadId)!}
          posts={posts}
          onFlag={handleFlag}
          onSubmitPost={handleSubmitPost}
          onBack={() => setSelectedThreadId(null)}
        />
      )}
    </div>
  );
}
