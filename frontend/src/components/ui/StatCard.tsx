import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: number;
  format?: (value: number) => string;
  icon: LucideIcon;
  iconTone: 'emerald' | 'rose' | 'indigo' | 'neutral';
  trend?: { direction: 'up' | 'down'; label: string };
}

const iconToneClasses: Record<StatCardProps['iconTone'], string> = {
  emerald: 'bg-emerald-soft text-emerald',
  rose: 'bg-rose-soft text-rose',
  indigo: 'bg-indigo-soft text-indigo',
  neutral: 'bg-surface-2 text-ink-muted',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  format = (v) => v.toLocaleString('en-IN'),
  icon: Icon,
  iconTone,
  trend,
}) => {
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="bg-surface border border-border-soft rounded-lg shadow-sm hover:shadow-md transition-shadow px-5 py-4"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-ink-muted">{title}</span>
        <span className={`w-7.5 h-7.5 rounded-sm flex items-center justify-center ${iconToneClasses[iconTone]}`}>
          <Icon size={14} />
        </span>
      </div>
      <div className="text-[26px] font-bold tracking-tight mt-2.5 tabular-nums">{format(animated)}</div>
      {trend ? (
        <div className="text-[11.5px] mt-2 flex items-center gap-1 text-ink-faint">
          <span className={trend.direction === 'up' ? 'text-emerald font-bold' : 'text-rose font-bold'}>
            {trend.direction === 'up' ? '▲' : '▼'}
          </span>
          <span>{trend.label}</span>
        </div>
      ) : null}
    </motion.div>
  );
};
