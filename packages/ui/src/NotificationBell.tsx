import * as React from 'react';
import { Notification } from 'types';

export const NotificationBell = ({
  notifications = [],
  onMarkAsRead,
}: {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          color: unreadCount > 0 ? 'var(--mark)' : 'var(--chalk)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{unreadCount}</span>}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '8px',
          width: '320px',
          background: 'var(--ink-2)',
          border: '1px solid var(--line)',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 100,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '16px', color: 'var(--dim)', textAlign: 'center', fontSize: '0.9rem' }}>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--line)',
                  background: n.isRead ? 'transparent' : 'var(--ink-3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--chalk)', fontSize: '0.9rem' }}>{n.title}</strong>
                  {!n.isRead && (
                    <button
                      onClick={() => onMarkAsRead?.(n.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--signal)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>{n.message}</div>
                <div style={{ color: 'var(--dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', marginTop: '6px', opacity: 0.7 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
