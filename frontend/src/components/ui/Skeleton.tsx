import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-sm bg-[linear-gradient(90deg,var(--color-surface-2)_25%,var(--color-border-soft)_37%,var(--color-surface-2)_63%)] bg-[length:400%_100%] animate-[shimmer_1.6s_ease-in-out_infinite] ${className}`}
  />
);
