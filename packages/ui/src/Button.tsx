import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'outline' | 'solid' | 'danger';
  size?: 'md' | 'sm';
};

export const Button = ({ children, variant = 'outline', size = 'md', className = '', ...props }: ButtonProps) => {
  const variantClass = variant === 'solid' ? 'btn-solid' : variant === 'danger' ? 'btn-danger' : '';
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
