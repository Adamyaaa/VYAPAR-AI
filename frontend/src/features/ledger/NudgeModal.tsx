import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal, Button } from '../../components/ui';
import { api, type Customer, type RecoveryNudge, type Transaction } from '../../utils/api';

interface NudgeModalProps {
  transaction: Transaction | null;
  existingNudge: RecoveryNudge | null;
  customer: Customer | null;
  onClose: () => void;
  onSent: () => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({ transaction, existingNudge, customer, onClose, onSent }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    if (existingNudge) {
      setMessage(existingNudge.message_text);
    } else if (transaction && customer) {
      setMessage(
        `Hi ${customer.name}, a transaction of ₹${Number(transaction.amount).toLocaleString('en-IN')} is pending on your ledger. Please settle when convenient. Thanks!`
      );
    }
  }, [transaction, existingNudge, customer]);

  if (!transaction) return null;

  const handleDispatch = async () => {
    setSending(true);
    try {
      let nudge = existingNudge;
      if (!nudge) {
        nudge = await api.createNudge({
          transaction_id: transaction.id,
          customer_id: transaction.customer_id,
          message_text: message,
          status: 'DRAFT',
          sent_at: null,
        });
      }
      await api.sendNudge(nudge.id);

      if (customer?.phone_number) {
        const clean = customer.phone_number.replace(/[^0-9+]/g, '');
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank');
      }

      onSent();
      onClose();
    } catch (err) {
      console.error('Failed to send nudge:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={!!transaction} onClose={onClose} title="Confirm WhatsApp nudge" eyebrow="Udhar Shield">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Recipient</label>
          <p className="text-sm font-semibold text-ink">{customer?.name}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>
        <div className="flex gap-2.5 pt-1">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 justify-center" onClick={handleDispatch} disabled={sending}>
            <Send size={14} />
            {sending ? 'Sending…' : 'Dispatch nudge'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
