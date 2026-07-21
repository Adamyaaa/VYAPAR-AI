import { useEffect, useState } from 'react';
import { api, type Customer, type Transaction, type RecoveryNudge } from '../../utils/api';

export function useLedgerData() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nudges, setNudges] = useState<RecoveryNudge[]>([]);

  const reload = async () => {
    try {
      const [c, t, n] = await Promise.all([api.getCustomers(), api.getTransactions(), api.getNudges()]);
      setCustomers(c);
      setTransactions([...t].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setNudges(n);
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { loading, customers, transactions, nudges, reload };
}
