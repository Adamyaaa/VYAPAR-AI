import React, { useState } from 'react';
import { Modal, Button } from '../../components/ui';
import { api } from '../../utils/api';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setOpeningBalance('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createCustomer({
        name: name.trim(),
        phone_number: phone.trim(),
        current_balance: Number(openingBalance) || 0,
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to add customer:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a new customer" eyebrow="Customers">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Full name</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Singh"
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Phone number (WhatsApp)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 99999 88888"
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1.5">Opening balance (₹)</label>
          <input
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="Positive = they owe you, negative = you owe them"
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          />
        </div>
        <div className="flex gap-2.5 pt-1">
          <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 justify-center" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : 'Add customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
