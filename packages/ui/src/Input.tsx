import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-[var(--ink-2)] border border-[var(--line)] text-[var(--chalk)] placeholder-[var(--dim)] rounded-lg px-3 py-2 font-[family-name:var(--body)] text-sm focus:outline-none focus-visible:outline-[2px] focus-visible:outline-[var(--signal)] focus-visible:outline-offset-[3px] transition-colors ${
          hasError ? 'border-[var(--mark)]' : ''
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
