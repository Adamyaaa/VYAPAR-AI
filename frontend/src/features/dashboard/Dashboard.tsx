import React from 'react';
import { IndianRupee, ArrowDownLeft, Percent, Users } from 'lucide-react';
import { StatCard, Skeleton } from '../../components/ui';
import { useDashboardData } from './useDashboardData';
import { HeroInsightCard } from './HeroInsightCard';
import { RecoveryTrendChart } from './RecoveryTrendChart';
import { RecentActivity } from './RecentActivity';
import { SmartSuggestions } from './SmartSuggestions';

const currency = (v: number) => `₹${v.toLocaleString('en-IN')}`;

function ComingSoonTile({ title }: { title: string }) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-lg px-5 py-4">
      <span className="text-xs font-semibold text-ink-muted">{title}</span>
      <div className="text-[26px] font-bold tracking-tight mt-2.5 text-ink-faint">—</div>
      <div className="text-[11.5px] mt-2 text-ink-faint">Needs more transaction history</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full" />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full lg:col-span-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const data = useDashboardData();

  if (data.loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <HeroInsightCard
        overdueCustomers={data.overdueCustomers}
        totalReceivables={data.totalReceivables}
        onRecover={() => {
          window.location.href = '/customers';
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Today's Revenue"
          value={data.todaysRevenue}
          format={currency}
          icon={IndianRupee}
          iconTone="emerald"
          trend={
            data.yesterdaysRevenue > 0
              ? {
                  direction: data.todaysRevenue >= data.yesterdaysRevenue ? 'up' : 'down',
                  label: 'vs yesterday',
                }
              : undefined
          }
        />
        <StatCard
          title="Outstanding Credit"
          value={data.totalReceivables}
          format={currency}
          icon={ArrowDownLeft}
          iconTone="rose"
          trend={
            data.receivablesNetChange7d !== 0
              ? {
                  direction: data.receivablesNetChange7d > 0 ? 'up' : 'down',
                  label: `${currency(Math.abs(data.receivablesNetChange7d))} this week`,
                }
              : undefined
          }
        />
        <StatCard
          title="Recovery Rate"
          value={data.recoveryRate}
          format={(v) => `${v}%`}
          icon={Percent}
          iconTone="indigo"
        />
        <StatCard
          title="Active Customers"
          value={data.activeCustomers}
          icon={Users}
          iconTone="neutral"
          trend={
            data.newCustomersThisWeek > 0
              ? { direction: 'up', label: `+${data.newCustomersThisWeek} this week` }
              : undefined
          }
        />
        <ComingSoonTile title="Monthly Growth" />
        <ComingSoonTile title="Avg. Payment Time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecoveryTrendChart data={data.chartData} />
        </div>
        <RecentActivity transactions={data.recentTransactions} customers={data.customers} />
      </div>

      <div>
        <h3 className="text-[15px] font-semibold text-ink mb-3">Smart suggestions</h3>
        <SmartSuggestions suggestions={data.suggestions} />
      </div>
    </div>
  );
};
