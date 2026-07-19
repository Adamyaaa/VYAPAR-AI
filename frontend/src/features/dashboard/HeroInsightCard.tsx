import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui';
import type { Customer } from '../../utils/api';

interface HeroInsightCardProps {
  overdueCustomers: Customer[];
  totalReceivables: number;
  onRecover: () => void;
}

export const HeroInsightCard: React.FC<HeroInsightCardProps> = ({ overdueCustomers, totalReceivables, onRecover }) => {
  const hasOverdue = overdueCustomers.length > 0;
  const names = overdueCustomers.slice(0, 2).map((c) => c.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-surface border border-border-soft shadow-sm p-8 md:p-9"
    >
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-indigo-ink bg-indigo-soft px-2.5 py-1 rounded-full mb-4">
        <Sparkles size={12} />
        Hisaab AI Insight
      </span>

      {hasOverdue ? (
        <>
          <p className="text-[22px] md:text-[26px] font-semibold tracking-tight text-ink max-w-xl mb-2 text-balance">
            ₹{totalReceivables.toLocaleString('en-IN')} is waiting to be collected from {overdueCustomers.length}{' '}
            customer{overdueCustomers.length === 1 ? '' : 's'}.
          </p>
          <p className="text-sm text-ink-muted max-w-lg mb-6">
            {names.join(' and ')}
            {overdueCustomers.length > 2 ? ` and ${overdueCustomers.length - 2} more` : ''} currently owe you money on
            the ledger.
          </p>
          <Button onClick={onRecover}>Review outstanding customers</Button>
        </>
      ) : (
        <>
          <p className="text-[22px] md:text-[26px] font-semibold tracking-tight text-ink max-w-xl mb-2 text-balance">
            Your ledger is fully settled.
          </p>
          <p className="text-sm text-ink-muted max-w-lg">
            No customer currently owes an outstanding balance. New credit entries will show up here.
          </p>
        </>
      )}
    </motion.div>
  );
};
