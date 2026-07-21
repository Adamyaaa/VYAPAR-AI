import { useEffect, useMemo, useState } from 'react';
import { api, type Customer, type Transaction } from '../../utils/api';

export type RiskLevel = 'settled' | 'payable' | 'reliable' | 'due' | 'high';
export type CustomerFilter = 'all' | 'outstanding' | 'vip' | 'at-risk';

// A customer is "VIP" once lifetime transaction volume crosses this — an
// explainable, fixed threshold rather than a percentile/ML score, since we
// don't have enough customers yet for a percentile to mean anything.
const VIP_VOLUME_THRESHOLD = 8000;

export interface EnrichedCustomer extends Customer {
  risk: RiskLevel;
  isVip: boolean;
  reliability: number | null; // % of lifetime issued credit recovered so far, or null if no credit ever issued
  lifetimeVolume: number;
  transactions: Transaction[];
  lastActivityAt: string | null;
}

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function computeRisk(customer: Customer): RiskLevel {
  if (customer.current_balance === 0) return 'settled';
  if (customer.current_balance < 0) return 'payable';
  const idle = daysSince(customer.updated_at);
  if (idle >= 14) return 'high';
  if (idle >= 7) return 'due';
  return 'reliable';
}

export function useCustomersData() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CustomerFilter>('all');

  const load = async () => {
    try {
      const [c, t] = await Promise.all([api.getCustomers(), api.getTransactions()]);
      setCustomers(c);
      setTransactions(t);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const enriched: EnrichedCustomer[] = useMemo(() => {
    return customers.map((c) => {
      const own = transactions.filter((t) => t.customer_id === c.id);
      const totalCredit = own.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
      const totalDebit = own.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
      const lifetimeVolume = totalCredit + totalDebit;
      const sorted = [...own].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        ...c,
        risk: computeRisk(c),
        isVip: lifetimeVolume >= VIP_VOLUME_THRESHOLD,
        reliability: totalCredit > 0 ? Math.min(100, Math.round((totalDebit / totalCredit) * 100)) : null,
        lifetimeVolume,
        transactions: sorted,
        lastActivityAt: sorted[0]?.created_at ?? null,
      };
    });
  }, [customers, transactions]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (filter === 'outstanding') list = list.filter((c) => c.current_balance > 0);
    else if (filter === 'vip') list = list.filter((c) => c.isVip);
    else if (filter === 'at-risk') list = list.filter((c) => c.risk === 'high' || c.risk === 'due');

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone_number?.includes(q));
    }
    return list;
  }, [enriched, filter, search]);

  const counts = useMemo(
    () => ({
      all: enriched.length,
      outstanding: enriched.filter((c) => c.current_balance > 0).length,
      vip: enriched.filter((c) => c.isVip).length,
      'at-risk': enriched.filter((c) => c.risk === 'high' || c.risk === 'due').length,
    }),
    [enriched]
  );

  return { loading, customers: filtered, counts, search, setSearch, filter, setFilter, reload: load };
}
