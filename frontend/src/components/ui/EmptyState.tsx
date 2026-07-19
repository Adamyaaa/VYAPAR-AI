import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12 px-5">
    <div className="w-11.5 h-11.5 rounded-md bg-surface-2 flex items-center justify-center mx-auto mb-4 text-ink-muted">
      <Icon size={20} />
    </div>
    <div className="text-sm font-semibold text-ink">{title}</div>
    {description && <div className="text-[12.5px] text-ink-faint mt-1">{description}</div>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
