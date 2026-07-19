import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Clock } from 'lucide-react';
import { Card, Avatar, EmptyState } from '../../components/ui';
import type { Customer, Transaction } from '../../utils/api';

interface RecentActivityProps {
  transactions: Transaction[];
  customers: Customer[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ transactions, customers }) => {
  return (
    <Card className="p-6">
      <h3 className="text-[15px] font-semibold text-ink m-0 mb-4">Recent activity</h3>

      {transactions.length === 0 ? (
        <EmptyState icon={Clock} title="No transactions yet" description="New ledger entries will appear here." />
      ) : (
        <div className="divide-y divide-border-soft">
          {transactions.map((tx, i) => {
            const customer = customers.find((c) => c.id === tx.customer_id);
            const isCredit = tx.type === 'CREDIT';
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="py-3 flex items-center gap-3"
              >
                <Avatar name={customer?.name ?? '?'} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink m-0 truncate">
                    {customer?.name ?? 'Customer'}{' '}
                    <span className={isCredit ? 'text-rose' : 'text-emerald'}>
                      {isCredit ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                    </span>
                  </p>
                  <p className="text-[11px] text-ink-faint m-0 mt-0.5 flex items-center gap-1">
                    {tx.voice_url && <Volume2 size={11} className="text-indigo" />}
                    {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
