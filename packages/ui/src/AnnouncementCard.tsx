import * as React from 'react';
import { Announcement } from 'types';

export const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => {
  return (
    <div style={{
      padding: '20px',
      background: 'var(--ink-2)',
      border: '1px solid var(--mark)', // Amber border for attention
      borderLeft: '4px solid var(--mark)',
      borderRadius: '4px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          color: 'var(--chalk)',
          fontWeight: 600
        }}>
          {announcement.title}
        </h3>
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--dim)' }}>
          <div>By {announcement.authorName}</div>
          <div>{new Date(announcement.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      <div style={{ color: 'var(--chalk)', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {announcement.content}
      </div>
    </div>
  );
};
