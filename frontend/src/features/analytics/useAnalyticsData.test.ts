import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalyticsData } from './useAnalyticsData';
import { api, type Customer, type Transaction } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  api: {
    getCustomers: vi.fn(),
    getTransactions: vi.fn(),
  },
}));

const customers: Customer[] = [
  { id: 'c1', business_id: 'b1', name: 'Rajesh', phone_number: '+91', current_balance: 4500, created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 'c2', business_id: 'b1', name: 'Priya', phone_number: '+91', current_balance: 9000, created_at: '2026-06-10T00:00:00Z', updated_at: '2026-06-10T00:00:00Z' },
];

const transactions: Transaction[] = [
  { id: 't1', business_id: 'b1', customer_id: 'c1', amount: 4500, type: 'CREDIT', description: null, voice_url: null, status: 'CONFIRMED', created_at: '2026-06-02T00:00:00Z', updated_at: '2026-06-02T00:00:00Z' },
  { id: 't2', business_id: 'b1', customer_id: 'c2', amount: 9000, type: 'CREDIT', description: null, voice_url: null, status: 'CONFIRMED', created_at: '2026-06-11T00:00:00Z', updated_at: '2026-06-11T00:00:00Z' },
  { id: 't3', business_id: 'b1', customer_id: 'c2', amount: 1000, type: 'DEBIT', description: null, voice_url: null, status: 'CONFIRMED', created_at: '2026-06-12T00:00:00Z', updated_at: '2026-06-12T00:00:00Z' },
];

describe('useAnalyticsData', () => {
  beforeEach(() => {
    vi.mocked(api.getCustomers).mockResolvedValue(customers);
    vi.mocked(api.getTransactions).mockResolvedValue(transactions);
  });

  it('builds a cumulative customer growth series ordered by signup date', async () => {
    const { result } = renderHook(() => useAnalyticsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.customerGrowth.map((p) => p.customers)).toEqual([1, 2]);
  });

  it('ranks top customers by lifetime transaction volume, descending', async () => {
    const { result } = renderHook(() => useAnalyticsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topCustomers[0].id).toBe('c2'); // 9000 + 1000 = 10000
    expect(result.current.topCustomers[0].lifetimeVolume).toBe(10000);
    expect(result.current.topCustomers[1].id).toBe('c1');
  });

  it('computes all-time credit/debit composition from every transaction', async () => {
    const { result } = renderHook(() => useAnalyticsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.composition.totalCredit).toBe(13500);
    expect(result.current.composition.totalDebit).toBe(1000);
  });

  it('reports hasData=false when there are no transactions', async () => {
    vi.mocked(api.getCustomers).mockResolvedValue([]);
    vi.mocked(api.getTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useAnalyticsData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hasData).toBe(false);
  });
});
