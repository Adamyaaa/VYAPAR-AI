import { useEffect, useMemo, useState } from 'react';
import { api, type Customer, type Transaction } from '../../utils/api';

export interface MonthOption {
  key: string; // "YYYY-MM"
  label: string; // "July 2026"
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function useReportsData() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, t] = await Promise.all([api.getCustomers(), api.getTransactions()]);
        setCustomers(c);
        setTransactions(t);
        if (t.length > 0) {
          const months = Array.from(new Set(t.map((tx) => monthKey(tx.created_at)))).sort().reverse();
          setSelectedMonth(months[0]);
        } else {
          setSelectedMonth(monthKey(new Date().toISOString()));
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const months: MonthOption[] = useMemo(() => {
    const keys = Array.from(new Set(transactions.map((tx) => monthKey(tx.created_at))));
    if (keys.length === 0) keys.push(monthKey(new Date().toISOString()));
    return keys.sort().reverse().map((key) => ({ key, label: monthLabel(key) }));
  }, [transactions]);

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => selectedMonth && monthKey(tx.created_at) === selectedMonth),
    [transactions, selectedMonth]
  );

  const summary = useMemo(() => {
    const totalCredit = monthTransactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
    const totalDebit = monthTransactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
    const uniqueCustomers = new Set(monthTransactions.map((t) => t.customer_id)).size;
    return {
      totalCredit,
      totalDebit,
      netChange: totalCredit - totalDebit,
      transactionCount: monthTransactions.length,
      uniqueCustomers,
    };
  }, [monthTransactions]);

  const exportCsv = () => {
    const rows = [['Date', 'Customer', 'Type', 'Amount', 'Status', 'Description']];
    for (const tx of monthTransactions) {
      const customer = customers.find((c) => c.id === tx.customer_id);
      rows.push([
        new Date(tx.created_at).toLocaleDateString('en-IN'),
        customer?.name ?? 'Unknown',
        tx.type,
        Number(tx.amount).toFixed(2),
        tx.status,
        tx.description ?? '',
      ]);
    }
    const csv = rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisaab-ledger-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    loading,
    months,
    selectedMonth,
    setSelectedMonth,
    monthTransactions,
    customers,
    summary,
    exportCsv,
  };
}
