import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Phone } from 'lucide-react';
import { Avatar, Badge } from '../../components/ui';
import type { EnrichedCustomer } from './useCustomersData';

const RISK_BADGE: Record<EnrichedCustomer['risk'], { tone: 'emerald' | 'amber' | 'rose' | 'neutral' | 'indigo'; label: string }> = {
  settled: { tone: 'neutral', label: 'Settled' },
  payable: { tone: 'indigo', label: 'You owe them' },
  reliable: { tone: 'emerald', label: 'Reliable' },
  due: { tone: 'amber', label: 'Payment due' },
  high: { tone: 'rose', label: 'High risk' },
};

function whatsAppLink(phone: string, name: string, balance: number): string {
  const clean = phone.replace(/[^0-9+]/g, '');
  const message =
    balance > 0
      ? `Hello ${name}, this is a gentle reminder. An outstanding balance of ₹${balance.toFixed(2)} is pending in your ledger. Please settle it soon. Thank you!`
      : `Hello ${name}, thank you for your business. Your ledger is currently settled.`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export const CustomerRow: React.FC<{ customer: EnrichedCustomer }> = ({ customer }) => {
  const [expanded, setExpanded] = useState(false);
  const risk = RISK_BADGE[customer.risk];
  const isOwed = customer.current_balance > 0;
  const isSettled = customer.current_balance === 0;

  return (
    <div className="border-b border-border-soft last:border-b-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <Avatar name={customer.name} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-semibold text-ink truncate m-0">{customer.name}</p>
            {customer.isVip && <Badge tone="indigo">★ VIP</Badge>}
          </div>
          <p className="text-[11.5px] text-ink-faint m-0 mt-0.5 flex items-center gap-1">
            <Phone size={10} />
            {customer.phone_number || 'No phone on file'}
          </p>
        </div>

        <div className="hidden sm:block">
          <Badge tone={risk.tone} dot>
            {risk.label}
          </Badge>
        </div>

        <div className="hidden md:block text-[12.5px] text-ink-muted w-24 text-right tabular-nums">
          {customer.reliability === null ? '—' : `${customer.reliability}% paid`}
        </div>

        <div className="text-right w-28 shrink-0">
          <p
            className={`text-sm font-bold tabular-nums m-0 ${
              isOwed ? 'text-rose' : isSettled ? 'text-ink-faint' : 'text-emerald'
            }`}
          >
            {isSettled ? 'Settled' : `₹${Math.abs(customer.current_balance).toLocaleString('en-IN')}`}
          </p>
        </div>

        <ChevronDown size={16} className={`text-ink-faint transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-17">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Payment history
                </span>
                {customer.phone_number && (
                  <a
                    href={whatsAppLink(customer.phone_number, customer.name, customer.current_balance)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald bg-emerald-soft hover:bg-emerald hover:text-white px-2.5 py-1 rounded-md transition-colors"
                  >
                    <MessageSquare size={12} />
                    WhatsApp
                  </a>
                )}
              </div>

              {customer.transactions.length === 0 ? (
                <p className="text-[12.5px] text-ink-faint">No transactions recorded for this customer yet.</p>
              ) : (
                <div className="space-y-2">
                  {customer.transactions.slice(0, 6).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-[12.5px]">
                      <span className="text-ink-muted">
                        {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        {t.description || 'Ledger entry'}
                      </span>
                      <span className={`font-semibold tabular-nums ${t.type === 'CREDIT' ? 'text-rose' : 'text-emerald'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
