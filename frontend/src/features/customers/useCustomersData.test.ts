import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCustomersData } from './useCustomersData';
import { api, type Customer, type Transaction } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  api: {
    getCustomers: vi.fn(),
    getTransactions: vi.fn(),
  },
}));

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const customers: Customer[] = [
  {
    id: 'c1',
    business_id: 'b1',
    name: 'Rajesh',
    phone_number: '+911111111111',
    current_balance: 4500,
    created_at: daysAgo(20),
    updated_at: daysAgo(20), // idle 20 days, owes money -> high risk
  },
  {
    id: 'c2',
    business_id: 'b1',
    name: 'Priya',
    phone_number: '+912222222222',
    current_balance: 9000, // above the 8000 VIP threshold once lifetime volume is counted
    created_at: daysAgo(2),
    updated_at: daysAgo(1), // recently active, owes money -> reliable
  },
  {
    id: 'c3',
    business_id: 'b1',
    name: 'Amit',
    phone_number: '+913333333333',
    current_balance: 0,
    created_at: daysAgo(10),
    updated_at: daysAgo(10), // settled -> no risk
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
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
  },
  {
    id: 't2',
    business_id: 'b1',
    customer_id: 'c2',
    amount: 9000,
    type: 'CREDIT',
    description: null,
    voice_url: null,
    status: 'CONFIRMED',
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
];

describe('useCustomersData', () => {
  beforeEach(() => {
    vi.mocked(api.getCustomers).mockResolvedValue(customers);
    vi.mocked(api.getTransactions).mockResolvedValue(transactions);
  });

  it('computes risk levels from balance and idle time', async () => {
    const { result } = renderHook(() => useCustomersData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const rajesh = result.current.customers.find((c) => c.id === 'c1')!;
    const priya = result.current.customers.find((c) => c.id === 'c2')!;
    const amit = result.current.customers.find((c) => c.id === 'c3')!;

    expect(rajesh.risk).toBe('high'); // owes money, idle 20 days
    expect(priya.risk).toBe('reliable'); // owes money, idle 1 day
    expect(amit.risk).toBe('settled'); // zero balance
  });

  it('flags VIP customers by lifetime transaction volume', async () => {
    const { result } = renderHook(() => useCustomersData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const priya = result.current.customers.find((c) => c.id === 'c2')!;
    const rajesh = result.current.customers.find((c) => c.id === 'c1')!;

    expect(priya.isVip).toBe(true); // 9000 lifetime volume >= 8000 threshold
    expect(rajesh.isVip).toBe(false); // 4500 < threshold
  });

  it('computes reliability as the share of issued credit recovered', async () => {
    const { result } = renderHook(() => useCustomersData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const rajesh = result.current.customers.find((c) => c.id === 'c1')!;
    expect(rajesh.reliability).toBe(0); // all CREDIT, no DEBIT recovered yet

    const amit = result.current.customers.find((c) => c.id === 'c3')!;
    expect(amit.reliability).toBeNull(); // never had any credit issued
  });

  it('filters by search across name and phone', async () => {
    const { result } = renderHook(() => useCustomersData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch('priya'));
    expect(result.current.customers.map((c) => c.id)).toEqual(['c2']);
  });

  it('filters to only at-risk customers', async () => {
    const { result } = renderHook(() => useCustomersData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFilter('at-risk'));
    expect(result.current.customers.map((c) => c.id)).toEqual(['c1']);
  });
});
