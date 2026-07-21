import React from 'react';
import { Download, FileText, IndianRupee, ArrowDownLeft, Users, Hash } from 'lucide-react';
import { Card, StatCard, Button, EmptyState, Skeleton, Avatar, Badge } from '../../components/ui';
import { useReportsData } from './useReportsData';

const currency = (v: number) => `₹${v.toLocaleString('en-IN')}`;

export const Reports: React.FC = () => {
  const { loading, months, selectedMonth, setSelectedMonth, monthTransactions, customers, summary, exportCsv } =
    useReportsData();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink m-0">Reports</h2>
          <p className="text-[12.5px] text-ink-faint m-0 mt-0.5">Monthly ledger summary, built from your recorded transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={exportCsv} disabled={monthTransactions.length === 0}>
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Credit Issued" value={summary.totalCredit} format={currency} icon={IndianRupee} iconTone="rose" />
        <StatCard title="Recovered" value={summary.totalDebit} format={currency} icon={ArrowDownLeft} iconTone="emerald" />
        <StatCard title="Customers Involved" value={summary.uniqueCustomers} icon={Users} iconTone="indigo" />
        <StatCard title="Transactions" value={summary.transactionCount} icon={Hash} iconTone="neutral" />
      </div>

      <Card className="px-4">
        {monthTransactions.length === 0 ? (
          <EmptyState icon={FileText} title="No transactions this month" description="Pick a different month, or record some ledger entries." />
        ) : (
          <div className="divide-y divide-border-soft">
            {monthTransactions.map((tx) => {
              const customer = customers.find((c) => c.id === tx.customer_id);
              const isCredit = tx.type === 'CREDIT';
              return (
                <div key={tx.id} className="flex items-center gap-3.5 py-3.5">
                  <Avatar name={customer?.name ?? 'Customer'} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink m-0">{customer?.name ?? 'Customer'}</p>
                    <p className="text-[11.5px] text-ink-faint m-0 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      {tx.description ? ` · ${tx.description}` : ''}
                    </p>
                  </div>
                  <Badge tone={tx.status === 'CONFIRMED' ? 'emerald' : 'amber'}>{tx.status}</Badge>
                  <p className={`text-sm font-semibold tabular-nums w-24 text-right m-0 ${isCredit ? 'text-rose' : 'text-emerald'}`}>
                    {isCredit ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
