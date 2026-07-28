import * as React from 'react';

export const Badge = ({ children, variant = 'dim', className = '' }: { children: React.ReactNode; variant?: 'teal' | 'amber' | 'dim', className?: string }) => {
  return (
    <span className={`pill pill-${variant} ${className}`}>
      {children}
    </span>
  );
};
