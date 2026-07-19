import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '../components/ui';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ icon, title, description }) => (
  <div className="bg-surface border border-border-soft rounded-lg shadow-sm min-h-[400px] flex items-center justify-center">
    <EmptyState icon={icon} title={title} description={description} />
  </div>
);
