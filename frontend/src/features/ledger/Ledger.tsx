import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { Card, EmptyState, Skeleton } from '../../components/ui';
import { useLedgerData } from './useLedgerData';
import { TransactionTimelineItem } from './TransactionTimelineItem';
import { AddTransactionModal } from './AddTransactionModal';
import { QuickEditModal } from './QuickEditModal';
import { NudgeModal } from './NudgeModal';
import type { Transaction } from '../../utils/api';

export const Ledger: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loading, customers, transactions, nudges, reload } = useLedgerData();

  const [addOpen, setAddOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [nudgingTx, setNudgingTx] = useState<Transaction | null>(null);

  const defaultType = searchParams.get('type')?.toUpperCase() === 'DEBIT' ? 'DEBIT' : 'CREDIT';

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const nudgingCustomer = nudgingTx ? customers.find((c) => c.id === nudgingTx.customer_id) ?? null : null;
  const nudgingExisting = nudgingTx ? nudges.find((n) => n.transaction_id === nudgingTx.id) ?? null : null;

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-ink m-0">Ledger</h2>
          <p className="text-[12.5px] text-ink-faint m-0 mt-0.5">Every credit and payment, newest first</p>
        </div>
      </div>

      <Card className="px-4">
        {transactions.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No transactions yet"
            description="Tap the + button to record your first ledger entry."
          />
        ) : (
          <div className="divide-y divide-border-soft">
            {transactions.map((tx, i) => (
              <TransactionTimelineItem
                key={tx.id}
                transaction={tx}
                customer={customers.find((c) => c.id === tx.customer_id)}
                nudge={nudges.find((n) => n.transaction_id === tx.id)}
                index={i}
                onEdit={() => setEditingTx(tx)}
                onSendNudge={() => setNudgingTx(tx)}
              />
            ))}
          </div>
        )}
      </Card>

      <button
        onClick={() => setAddOpen(true)}
        disabled={customers.length === 0}
        title={customers.length === 0 ? 'Add a customer first' : 'New ledger entry'}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-indigo text-white shadow-[0_10px_30px_-8px_rgba(79,70,229,0.5)] hover:bg-indigo-ink transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed z-10"
      >
        <Plus size={24} />
      </button>

      <AddTransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={reload}
        customers={customers}
        defaultType={defaultType}
      />
      <QuickEditModal transaction={editingTx} onClose={() => setEditingTx(null)} onSaved={reload} />
      <NudgeModal
        transaction={nudgingTx}
        existingNudge={nudgingExisting}
        customer={nudgingCustomer}
        onClose={() => setNudgingTx(null)}
        onSent={reload}
      />
    </div>
  );
};
