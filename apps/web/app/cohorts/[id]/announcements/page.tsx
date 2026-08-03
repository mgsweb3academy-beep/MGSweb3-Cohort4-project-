"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnnouncementCard } from 'ui';
import { Announcement } from 'types';

export default function AnnouncementsPage() {
  const { id: cohortId } = useParams() as { id: string };
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAnnouncements([
        {
          id: 'mock-announcement-1',
          cohortId,
          title: 'Welcome to Week 1',
          content: 'Please make sure you have Docker installed and running for the first assignment.',
          authorId: 'instructor-1',
          authorName: 'Instructor Alice',
          createdAt: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 500);
  }, [cohortId]);

  if (loading) return <div style={{ color: 'var(--dim)', padding: '24px' }}>Loading announcements...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--chalk)', margin: 0, fontSize: '2rem' }}>
          Announcements
        </h1>
      </div>
      
      {announcements.length === 0 ? (
        <div style={{ color: 'var(--dim)', padding: '24px 0' }}>No announcements yet.</div>
      ) : (
        announcements.map(a => <AnnouncementCard key={a.id} announcement={a} />)
      )}
    </div>
  );
}
