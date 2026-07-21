import React, { useState } from 'react';
import { Modal, Button } from '../../components/ui';
import { api, type Transaction } from '../../utils/api';

interface QuickEditModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

export const QuickEditModal: React.FC<QuickEditModalProps> = ({ transaction, onClose, onSaved }) => {
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [status, setStatus] = useState<Transaction['status']>(transaction?.status ?? 'PENDING');
  const [saving, setSaving] = useState(false);

  // Re-sync local state whenever a different transaction is opened.
  React.useEffect(() => {
    setDescription(transaction?.description ?? '');
    setStatus(transaction?.status ?? 'PENDING');
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateTransaction(transaction.id, { description, status });
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to update transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!transaction} onClose={onClose} title="Edit entry" eyebrow="Quick edit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Notes</label>
          <textarea
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm min-h-[64px] focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Status</label>
          <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1.5 rounded-md border border-border-soft">
            <button
              type="button"
              onClick={() => setStatus('PENDING')}
              className={`py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                status === 'PENDING' ? 'bg-amber text-white' : 'text-ink-muted hover:bg-surface'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatus('CONFIRMED')}
              className={`py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                status === 'CONFIRMED' ? 'bg-emerald text-white' : 'text-ink-muted hover:bg-surface'
              }`}
            >
              Confirmed
            </button>
          </div>
        </div>
        <div className="flex gap-2.5 pt-1">
          <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 justify-center" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
