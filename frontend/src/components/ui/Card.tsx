import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div
    className={`bg-surface border border-border-soft rounded-lg shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);
