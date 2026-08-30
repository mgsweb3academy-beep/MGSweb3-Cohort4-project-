import React from 'react';

type StatusPillProps = {
  children: React.ReactNode;
  variant?: 'teal' | 'amber' | 'dim';
  className?: string;
};

export const StatusPill = ({ children, variant = 'dim', className = '' }: StatusPillProps) => {
  const variantClass = `pill-${variant}`;
  return (
    <span className={`pill ${variantClass} ${className}`}>
      {children}
    </span>
  );
};

export const Tick = ({ status }: { status?: 'done' | 'late' | 'open' }) => {
  const cls = status === 'done' ? 'tick-done' : status === 'late' ? 'tick-warn' : '';
  return <i className={`tick ${cls}`} />;
};

type SplitShare = {
  share: number; // percentage (0-100)
  color: string;
};

export const SplitBar = ({ shares }: { shares: SplitShare[] }) => {
  return (
    <div className="split">
      {shares.map((s, i) => (
        <i key={i} style={{ width: `${s.share}%`, background: s.color }} />
      ))}
    </div>
  );
};
