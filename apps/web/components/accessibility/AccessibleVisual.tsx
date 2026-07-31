'use client';

import React from 'react';

export interface AccessibleVisualProps {
  /**
   * Accessible description describing the chart/matrix data representation.
   * Required per PRODUCT-DIRECTION.md §7.
   */
  description: string;
  /**
   * Title or label of the visual data representation.
   */
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * AccessibleVisual Component
 * Enforces role="img" + aria-label text equivalents for visual matrix charts, contribution grids, and data graphs (§6 Accessibility).
 */
export function AccessibleVisual({
  description,
  title,
  children,
  className = '',
}: AccessibleVisualProps) {
  const fullLabel = title ? `${title}: ${description}` : description;

  return (
    <div
      role="img"
      aria-label={fullLabel}
      tabIndex={0}
      className={`relative outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${className}`}
    >
      {/* Screen Reader Only Summary */}
      <span className="sr-only">{fullLabel}</span>
      
      {/* Visual Content */}
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
