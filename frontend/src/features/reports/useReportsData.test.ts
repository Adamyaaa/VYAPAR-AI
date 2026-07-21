import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useReportsData } from './useReportsData';
import { api, type Customer, type Transaction } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  api: {
    getCustomers: vi.fn(),
    getTransactions: vi.fn(),
  },
}));

const customers: Customer[] = [
  { id: 'c1', business_id: 'b1', name: 'Rajesh', phone_number: '+91', current_balance: 0, created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
];

const transactions: Transaction[] = [
  { id: 't1', business_id: 'b1', customer_id: 'c1', amount: 1000, type: 'CREDIT', description: 'June entry', voice_url: null, status: 'CONFIRMED', created_at: '2026-06-10T00:00:00Z', updated_at: '2026-06-10T00:00:00Z' },
  { id: 't2', business_id: 'b1', customer_id: 'c1', amount: 400, type: 'DEBIT', description: 'June payment', voice_url: null, status: 'CONFIRMED', created_at: '2026-06-15T00:00:00Z', updated_at: '2026-06-15T00:00:00Z' },
  { id: 't3', business_id: 'b1', customer_id: 'c1', amount: 200, type: 'CREDIT', description: 'July entry', voice_url: null, status: 'PENDING', created_at: '2026-07-05T00:00:00Z', updated_at: '2026-07-05T00:00:00Z' },
];

describe('useReportsData', () => {
  beforeEach(() => {
    vi.mocked(api.getCustomers).mockResolvedValue(customers);
    vi.mocked(api.getTransactions).mockResolvedValue(transactions);
  });

  it('defaults to the most recent month with transactions', async () => {
    const { result } = renderHook(() => useReportsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.selectedMonth).toBe('2026-07');
  });

  it('lists all months that actually have transactions, newest first', async () => {
    const { result } = renderHook(() => useReportsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.months.map((m) => m.key)).toEqual(['2026-07', '2026-06']);
  });

  it('computes summary totals scoped to the selected month only', async () => {
    const { result } = renderHook(() => useReportsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSelectedMonth('2026-06'));

    expect(result.current.summary.totalCredit).toBe(1000);
    expect(result.current.summary.totalDebit).toBe(400);
    expect(result.current.summary.netChange).toBe(600);
    expect(result.current.summary.transactionCount).toBe(2);
    expect(result.current.monthTransactions.map((t) => t.id)).toEqual(['t1', 't2']);
  });
});
