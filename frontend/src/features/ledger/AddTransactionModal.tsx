import React, { useState } from 'react';
import { Modal, Button } from '../../components/ui';
import { VoiceRecorder } from './VoiceRecorder';
import { api, type Customer } from '../../utils/api';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  customers: Customer[];
  defaultType?: 'CREDIT' | 'DEBIT';
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  open,
  onClose,
  onCreated,
  customers,
  defaultType = 'CREDIT',
}) => {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setAmount('');
    setDescription('');
    setVoiceUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount) return;
    setSaving(true);
    try {
      const tx = await api.createTransaction({
        customer_id: customerId,
        amount: Number(amount),
        type,
        description: description || null,
        voice_url: voiceUrl,
        status: 'CONFIRMED',
      });

      if (type === 'CREDIT') {
        const customer = customers.find((c) => c.id === customerId);
        await api.createNudge({
          transaction_id: tx.id,
          customer_id: customerId,
          message_text: `Hi ${customer?.name ?? 'there'}, a transaction of ₹${Number(tx.amount).toLocaleString('en-IN')} is pending on your ledger. Please settle when convenient. Thanks!`,
          status: 'DRAFT',
          sent_at: null,
        });
      }

      reset();
      onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New ledger entry" eyebrow="Ledger">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (₹{c.current_balance.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Type</label>
          <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1.5 rounded-md border border-border-soft">
            <button
              type="button"
              onClick={() => setType('CREDIT')}
              className={`py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                type === 'CREDIT' ? 'bg-rose text-white' : 'text-ink-muted hover:bg-surface'
              }`}
            >
              Give credit (Udhar)
            </button>
            <button
              type="button"
              onClick={() => setType('DEBIT')}
              className={`py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                type === 'DEBIT' ? 'bg-emerald text-white' : 'text-ink-muted hover:bg-surface'
              }`}
            >
              Receive payment
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Amount (₹)</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-base font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 5kg rice, sugar pack…"
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm min-h-[64px] focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>

        <VoiceRecorder
          onTranscribed={(transcript, url) => {
            setDescription(transcript);
            setVoiceUrl(url);
          }}
        />

        <div className="flex gap-2.5 pt-1">
          <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 justify-center" disabled={saving || !customerId || !amount}>
            {saving ? 'Saving…' : 'Add to ledger'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
