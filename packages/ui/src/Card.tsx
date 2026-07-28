import * as React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};
