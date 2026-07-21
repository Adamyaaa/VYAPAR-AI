import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, MessageSquare, CheckCircle2, Pencil } from 'lucide-react';
import { Avatar, Badge } from '../../components/ui';
import type { Customer, RecoveryNudge, Transaction } from '../../utils/api';

interface TransactionTimelineItemProps {
  transaction: Transaction;
  customer: Customer | undefined;
  nudge: RecoveryNudge | undefined;
  index: number;
  onEdit: () => void;
  onSendNudge: () => void;
}

export const TransactionTimelineItem: React.FC<TransactionTimelineItemProps> = ({
  transaction,
  customer,
  nudge,
  index,
  onEdit,
  onSendNudge,
}) => {
  const isCredit = transaction.type === 'CREDIT';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
      className="flex items-start gap-3.5 py-4 px-2 -mx-2 rounded-md hover:bg-surface-2 transition-colors group"
    >
      <Avatar name={customer?.name ?? 'Customer'} size={38} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13.5px] font-semibold text-ink m-0">{customer?.name ?? 'Customer'}</p>
          <Badge tone={transaction.status === 'CONFIRMED' ? 'emerald' : 'amber'}>{transaction.status}</Badge>
          {transaction.voice_url && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-indigo">
              <Volume2 size={11} /> Voice
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-ink-muted mt-0.5">{transaction.description || 'No notes'}</p>
        <p className="text-[11px] text-ink-faint mt-1">
          {new Date(transaction.created_at).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className={`text-[15px] font-bold tabular-nums m-0 ${isCredit ? 'text-rose' : 'text-emerald'}`}>
          {isCredit ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN')}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            title="Quick edit"
            className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-surface cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          {isCredit &&
            (nudge?.status === 'SENT' ? (
              <span title="Nudge sent" className="p-1.5 text-emerald">
                <CheckCircle2 size={14} />
              </span>
            ) : (
              <button
                onClick={onSendNudge}
                title="Send nudge"
                className="p-1.5 rounded-md text-indigo hover:bg-indigo-soft cursor-pointer"
              >
                <MessageSquare size={13} />
              </button>
            ))}
        </div>
      </div>
    </motion.div>
  );
};
