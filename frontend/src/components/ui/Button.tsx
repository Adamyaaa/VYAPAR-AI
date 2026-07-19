import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-indigo text-white shadow-[0_3px_8px_-3px_rgba(79,70,229,0.4)] hover:bg-indigo-ink',
  secondary: 'bg-surface text-ink border border-border hover:border-ink-faint',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink',
  danger: 'bg-rose-soft text-rose hover:bg-rose hover:text-white',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-sm font-semibold transition-all active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
