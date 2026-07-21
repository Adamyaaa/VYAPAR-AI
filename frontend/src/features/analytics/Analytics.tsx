import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, EmptyState, Skeleton, Avatar, Badge } from '../../components/ui';
import { useAnalyticsData } from './useAnalyticsData';

export const Analytics: React.FC = () => {
  const { loading, customerGrowth, weeklyCashFlow, topCustomers, composition, hasData } = useAnalyticsData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <EmptyState icon={TrendingUp} title="Not enough data yet" description="Analytics build up as you record transactions and add customers." />
      </Card>
    );
  }

  const recoveryPct = composition.totalCredit > 0 ? Math.round((composition.totalDebit / composition.totalCredit) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-semibold text-ink m-0">Analytics</h2>
        <p className="text-[12.5px] text-ink-faint m-0 mt-0.5">Longer-range trends across your whole ledger history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink m-0">Customer growth</h3>
          <p className="text-[11.5px] text-ink-faint m-0 mt-0.5">Cumulative customers added over time</p>
          <div className="h-56 mt-3 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-indigo)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="customers" stroke="var(--color-indigo)" strokeWidth={2.5} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink m-0">Weekly cash flow</h3>
          <p className="text-[11.5px] text-ink-faint m-0 mt-0.5">Credit issued vs. recovered, by week</p>
          <div className="h-56 mt-3 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCashFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="credit" name="Credit issued" fill="var(--color-rose)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debit" name="Recovered" fill="var(--color-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-ink m-0 mb-4">Top customers by lifetime volume</h3>
          <div className="space-y-1">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2">
                <span className="text-[11px] font-bold text-ink-faint w-4 tabular-nums">{i + 1}</span>
                <Avatar name={c.name} size={30} />
                <span className="text-[13px] font-medium text-ink flex-1 truncate">{c.name}</span>
                <span className="text-[13px] font-semibold tabular-nums text-ink">₹{c.lifetimeVolume.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink m-0 mb-3">All-time recovery</h3>
          <div className="flex items-center gap-2 mb-4">
            <Badge tone={recoveryPct >= 70 ? 'emerald' : recoveryPct >= 40 ? 'amber' : 'rose'}>{recoveryPct}% recovered</Badge>
          </div>
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-ink-muted">Credit issued</span>
              <span className="font-semibold tabular-nums text-ink">₹{composition.totalCredit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Recovered</span>
              <span className="font-semibold tabular-nums text-ink">₹{composition.totalDebit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
