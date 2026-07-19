import React from 'react';

type Tone = 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral';

interface BadgeProps {
  tone: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  emerald: 'bg-emerald-soft text-emerald',
  amber: 'bg-amber-soft text-amber',
  rose: 'bg-rose-soft text-rose',
  indigo: 'bg-indigo-soft text-indigo-ink',
  neutral: 'bg-surface-2 text-ink-muted border border-border-soft',
};

export const Badge: React.FC<BadgeProps> = ({ tone, dot = false, children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${toneClasses[tone]} ${className}`}
  >
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
    {children}
  </span>
);
