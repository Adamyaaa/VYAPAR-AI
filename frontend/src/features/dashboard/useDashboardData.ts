import { useEffect, useState } from 'react';
import { api, type Customer, type Transaction } from '../../utils/api';

export interface ChartPoint {
  date: string;
  label: string;
  net: number;
}

export interface Suggestion {
  id: string;
  intent: 'suggestion' | 'warning';
  title: string;
  body: string;
}

export interface DashboardData {
  loading: boolean;
  customers: Customer[];
  transactions: Transaction[];
  totalReceivables: number;
  totalPayables: number;
  todaysRevenue: number;
  yesterdaysRevenue: number;
  recoveryRate: number;
  activeCustomers: number;
  newCustomersThisWeek: number;
  receivablesNetChange7d: number;
  overdueCustomers: Customer[];
  chartData: ChartPoint[];
  suggestions: Suggestion[];
  recentTransactions: Transaction[];
}

function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
  );
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function useDashboardData(): DashboardData {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [c, t] = await Promise.all([api.getCustomers(), api.getTransactions()]);
        if (cancelled) return;
        setCustomers(c);
        setTransactions(t);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalReceivables = customers.filter((c) => c.current_balance > 0).reduce((s, c) => s + c.current_balance, 0);
  const totalPayables = Math.abs(
    customers.filter((c) => c.current_balance < 0).reduce((s, c) => s + c.current_balance, 0)
  );

  const today = new Date();
  const yesterday = daysAgo(1);
  const todaysRevenue = transactions
    .filter((t) => t.type === 'DEBIT' && isSameDay(t.created_at, today))
    .reduce((s, t) => s + Number(t.amount), 0);
  const yesterdaysRevenue = transactions
    .filter((t) => t.type === 'DEBIT' && isSameDay(t.created_at, yesterday))
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalCredit = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalDebit = transactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
  const recoveryRate = totalCredit > 0 ? Math.min(100, Math.round((totalDebit / totalCredit) * 100)) : 0;

  const weekAgo = daysAgo(7);
  const newCustomersThisWeek = customers.filter((c) => new Date(c.created_at) >= weekAgo).length;
  const receivablesNetChange7d = transactions
    .filter((t) => new Date(t.created_at) >= weekAgo)
    .reduce((s, t) => s + (t.type === 'CREDIT' ? Number(t.amount) : -Number(t.amount)), 0);

  const overdueCustomers = [...customers]
    .filter((c) => c.current_balance > 0)
    .sort((a, b) => b.current_balance - a.current_balance);

  // Daily net change (CREDIT issued minus DEBIT recovered) — a real trend line
  // derived only from stored transactions, not a projected/fabricated balance history.
  const byDay = new Map<string, number>();
  for (const t of transactions) {
    const date = t.created_at.slice(0, 10);
    const delta = t.type === 'CREDIT' ? Number(t.amount) : -Number(t.amount);
    byDay.set(date, (byDay.get(date) ?? 0) + delta);
  }
  const chartData: ChartPoint[] = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, net]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      net,
    }));

  const suggestions: Suggestion[] = [];
  if (overdueCustomers[0]) {
    suggestions.push({
      id: `recover-${overdueCustomers[0].id}`,
      intent: 'suggestion',
      title: `Recover ₹${overdueCustomers[0].current_balance.toLocaleString('en-IN')} from ${overdueCustomers[0].name}`,
      body: 'Highest outstanding balance on your ledger right now.',
    });
  }
  // Day-level "how stale is this" math only needs to be roughly current — it
  // naturally recomputes on every data reload, so a single render-time
  // Date.now() read (not tracked as reactive state) is a deliberate,
  // proportionate choice here rather than wiring up a ticking interval.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const staleCustomer = customers.find((c) => {
    if (c.current_balance <= 0) return false;
    const daysSinceUpdate = (now - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 7;
  });
  if (staleCustomer) {
    const days = Math.floor((now - new Date(staleCustomer.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    suggestions.push({
      id: `stale-${staleCustomer.id}`,
      intent: 'warning',
      title: `${staleCustomer.name} hasn't paid in ${days} days`,
      body: 'No activity on this account recently — consider a follow-up.',
    });
  }

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    loading,
    customers,
    transactions,
    totalReceivables,
    totalPayables,
    todaysRevenue,
    yesterdaysRevenue,
    recoveryRate,
    activeCustomers: customers.length,
    newCustomersThisWeek,
    receivablesNetChange7d,
    overdueCustomers,
    chartData,
    suggestions,
    recentTransactions,
  };
}
