import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type Intent = 'insight' | 'suggestion' | 'warning' | 'prediction';

interface AICardProps {
  intent: Intent;
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}

const intentClasses: Record<Intent, { card: string; icon: string; kicker: string }> = {
  insight: { card: 'bg-indigo-soft border-indigo/15', icon: 'bg-surface text-indigo', kicker: 'text-indigo-ink' },
  suggestion: { card: 'bg-emerald-soft border-emerald/20', icon: 'bg-surface text-emerald', kicker: 'text-emerald' },
  warning: { card: 'bg-amber-soft border-amber/20', icon: 'bg-surface text-amber', kicker: 'text-amber' },
  prediction: { card: 'bg-surface-2 border-border', icon: 'bg-surface text-ink-muted', kicker: 'text-ink-muted' },
};

export const AICard: React.FC<AICardProps> = ({ intent, icon: Icon, kicker, title, body, action, className = '' }) => {
  const cls = intentClasses[intent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-5 flex gap-3.5 ${cls.card} ${className}`}
    >
      <div className={`w-8.5 h-8.5 rounded-sm flex items-center justify-center shrink-0 ${cls.icon}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[10.5px] font-bold uppercase tracking-wider mb-0.5 ${cls.kicker}`}>{kicker}</div>
        <div className="text-sm font-semibold text-ink mb-0.5">{title}</div>
        <div className="text-[13px] text-ink-muted">{body}</div>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </motion.div>
  );
};
