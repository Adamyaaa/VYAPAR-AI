import { useEffect, useMemo, useState } from 'react';
import { api, type Customer, type Transaction } from '../../utils/api';

export interface GrowthPoint {
  label: string;
  customers: number;
}

export interface WeeklyCashFlowPoint {
  label: string;
  credit: number;
  debit: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  lifetimeVolume: number;
  currentBalance: number;
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  const firstDayOfWeek = new Date(d);
  firstDayOfWeek.setDate(d.getDate() - d.getDay());
  return firstDayOfWeek.toISOString().slice(0, 10);
}

export function useAnalyticsData() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, t] = await Promise.all([api.getCustomers(), api.getTransactions()]);
        setCustomers(c);
        setTransactions(t);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const customerGrowth: GrowthPoint[] = useMemo(() => {
    const sorted = [...customers].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let running = 0;
    return sorted.map((c) => {
      running += 1;
      return {
        label: new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        customers: running,
      };
    });
  }, [customers]);

  const weeklyCashFlow: WeeklyCashFlowPoint[] = useMemo(() => {
    const byWeek = new Map<string, { credit: number; debit: number }>();
    for (const t of transactions) {
      const key = weekKey(t.created_at);
      const entry = byWeek.get(key) ?? { credit: 0, debit: 0 };
      if (t.type === 'CREDIT') entry.credit += Number(t.amount);
      else entry.debit += Number(t.amount);
      byWeek.set(key, entry);
    }
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        label: new Date(key).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        ...v,
      }));
  }, [transactions]);

  const topCustomers: TopCustomer[] = useMemo(() => {
    return customers
      .map((c) => {
        const own = transactions.filter((t) => t.customer_id === c.id);
        const lifetimeVolume = own.reduce((s, t) => s + Number(t.amount), 0);
        return { id: c.id, name: c.name, lifetimeVolume, currentBalance: c.current_balance };
      })
      .sort((a, b) => b.lifetimeVolume - a.lifetimeVolume)
      .slice(0, 5);
  }, [customers, transactions]);

  const composition = useMemo(() => {
    const totalCredit = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
    const totalDebit = transactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
    return { totalCredit, totalDebit };
  }, [transactions]);

  return { loading, customerGrowth, weeklyCashFlow, topCustomers, composition, hasData: transactions.length > 0 };
}
