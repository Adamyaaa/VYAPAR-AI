import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from './useDashboardData';
import { api, type Customer, type Transaction } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  api: {
    getCustomers: vi.fn(),
    getTransactions: vi.fn(),
  },
}));

const iso = (d: Date) => d.toISOString();
const daysAgoDate = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const customers: Customer[] = [
  {
    id: 'c1',
    business_id: 'b1',
    name: 'Rajesh',
    phone_number: '+911111111111',
    current_balance: 4500,
    created_at: iso(daysAgoDate(2)),
    updated_at: iso(daysAgoDate(10)), // owes money, idle 10 days -> stale suggestion candidate
  },
  {
    id: 'c2',
    business_id: 'b1',
    name: 'Amit',
    phone_number: '+912222222222',
    current_balance: -1200, // we owe them — not receivable, not payable-risk
    created_at: iso(daysAgoDate(1)),
    updated_at: iso(daysAgoDate(1)),
  },
];

const transactions: Transaction[] = [
  {
    id: 't1',
    business_id: 'b1',
    customer_id: 'c1',
    amount: 4500,
    type: 'CREDIT',
    description: null,
    voice_url: null,
    status: 'CONFIRMED',
    created_at: iso(daysAgoDate(2)),
    updated_at: iso(daysAgoDate(2)),
  },
  {
    id: 't2',
    business_id: 'b1',
    customer_id: 'c2',
    amount: 1200,
    type: 'DEBIT',
    description: null,
    voice_url: null,
    status: 'CONFIRMED',
    created_at: iso(new Date()), // today
    updated_at: iso(new Date()),
  },
];

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.mocked(api.getCustomers).mockResolvedValue(customers);
    vi.mocked(api.getTransactions).mockResolvedValue(transactions);
  });

  it('computes total receivables and payables from customer balances only', async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalReceivables).toBe(4500);
    expect(result.current.totalPayables).toBe(1200);
  });

  it("counts today's DEBIT transactions as today's revenue", async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.todaysRevenue).toBe(1200);
  });

  it('computes recovery rate as debit/credit ratio, capped at 100', async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // 1200 debit / 4500 credit = 26.67% -> rounds to 27
    expect(result.current.recoveryRate).toBe(27);
  });

  it('never fabricates a suggestion when nothing is overdue or stale', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue([]);
    vi.mocked(api.getTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.overdueCustomers).toEqual([]);
  });

  it('surfaces the highest-balance customer as the top recovery suggestion', async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const recoverySuggestion = result.current.suggestions.find((s) => s.intent === 'suggestion');
    expect(recoverySuggestion?.title).toContain('Rajesh');
  });
});
