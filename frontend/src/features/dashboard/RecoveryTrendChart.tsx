import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, EmptyState } from '../../components/ui';
import type { ChartPoint } from './useDashboardData';

interface RecoveryTrendChartProps {
  data: ChartPoint[];
}

export const RecoveryTrendChart: React.FC<RecoveryTrendChartProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <div className="mb-1">
        <h3 className="text-[15px] font-semibold text-ink m-0">Recovery trend</h3>
        <p className="text-[11.5px] text-ink-faint m-0 mt-0.5">
          Daily net change in outstanding balance — credit issued minus payments recovered
        </p>
      </div>

      {data.length < 2 ? (
        <EmptyState
          icon={TrendingUp}
          title="Not enough history yet"
          description="Record a few more days of transactions to see a trend here."
        />
      ) : (
        <div className="h-40 mt-3 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-indigo)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net change']}
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke="var(--color-indigo)"
                strokeWidth={2.5}
                fill="url(#netFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
