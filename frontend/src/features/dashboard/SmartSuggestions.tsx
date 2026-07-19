import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AICard, EmptyState } from '../../components/ui';
import type { Suggestion } from './useDashboardData';

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ suggestions }) => {
  if (suggestions.length === 0) {
    return (
      <div className="bg-surface border border-border-soft rounded-lg shadow-sm">
        <EmptyState icon={CheckCircle2} title="Nothing needs attention" description="You're all caught up for now." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s) => (
        <AICard
          key={s.id}
          intent={s.intent}
          icon={s.intent === 'warning' ? AlertTriangle : ArrowRight}
          kicker={s.intent === 'warning' ? 'Warning' : 'Suggestion'}
          title={s.title}
          body={s.body}
        />
      ))}
    </div>
  );
};
