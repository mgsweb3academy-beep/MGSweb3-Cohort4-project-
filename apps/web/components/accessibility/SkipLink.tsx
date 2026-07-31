'use client';

import React from 'react';

export interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

/**
 * SkipLink Component
 * Allows keyboard and screen reader users to skip navigation and jump directly to main page content (§6 Accessibility).
 */
export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none"
    >
      {label}
    </a>
  );
}
