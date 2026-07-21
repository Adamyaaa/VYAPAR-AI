const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Used only to populate the offline/demo dataset below — has no relation to
// any real Supabase Auth user id, just a stable id for the mock records to share.
const MOCK_BUSINESS_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone_number: string;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  customer_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string | null;
  voice_url: string | null;
  status: 'PENDING' | 'CONFIRMED';
  created_at: string;
  updated_at: string;
}

export interface RecoveryNudge {
  id: string;
  transaction_id: string;
  customer_id: string;
  message_text: string;
  status: 'DRAFT' | 'SENT';
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// Initial mock data to populate local storage if backend is unavailable
const INITIAL_MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1-uuid-1111-2222',
    business_id: MOCK_BUSINESS_ID,
    name: 'Rajesh Kirana Store',
    phone_number: '+91 98765 43210',
    current_balance: 4500.00, // Positive balance means they owe money (Credit to customer)
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c2-uuid-3333-4444',
    business_id: MOCK_BUSINESS_ID,
    name: 'Amit Kumar (Milkman)',
    phone_number: '+91 91234 56789',
    current_balance: -1200.00, // Negative balance means we owe them (Debit from customer)
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c3-uuid-5555-6666',
    business_id: MOCK_BUSINESS_ID,
    name: 'Priya Verma (Boutique)',
    phone_number: '+91 88888 77777',
    current_balance: 8900.50,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c4-uuid-7777-8888',
    business_id: MOCK_BUSINESS_ID,
    name: 'Verma Ji Sweets',
    phone_number: '+91 77777 66666',
    current_balance: 0.00,
    created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1-uuid',
    business_id: MOCK_BUSINESS_ID,
    customer_id: 'c1-uuid-1111-2222',
    amount: 3000.00,
    type: 'CREDIT',
    description: 'Supplied monthly grocery batch',
    voice_url: null,
    status: 'CONFIRMED',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 't2-uuid',
    business_id: MOCK_BUSINESS_ID,
    customer_id: 'c1-uuid-1111-2222',
    amount: 1500.00,
    type: 'CREDIT',
    description: 'Additional orders (rice bags)',
    voice_url: 'https://hisaab.ai/audio/mock-voice-1.mp3', // Mock voice url
    status: 'PENDING',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 't3-uuid',
    business_id: MOCK_BUSINESS_ID,
    customer_id: 'c2-uuid-3333-4444',
    amount: 1200.00,
    type: 'DEBIT',
    description: 'Settled dairy supplies bill',
    voice_url: null,
    status: 'CONFIRMED',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 't4-uuid',
    business_id: MOCK_BUSINESS_ID,
    customer_id: 'c3-uuid-5555-6666',
    amount: 8900.50,
    type: 'CREDIT',
    description: 'Designer dresses fabric order',
    voice_url: 'https://hisaab.ai/audio/mock-voice-2.mp3',
    status: 'CONFIRMED',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_MOCK_NUDGES: RecoveryNudge[] = [
  {
    id: 'n1-uuid',
    transaction_id: 't2-uuid',
    customer_id: 'c1-uuid-1111-2222',
    message_text: 'Dear Rajesh Kirana Store, a transaction of ₹1,500.00 is pending. Please verify and settle. Thanks, Hisaab AI.',
    status: 'DRAFT',
    sent_at: null,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  }
];

// Initialize localStorage if empty
if (!localStorage.getItem('hisaab_customers')) {
  localStorage.setItem('hisaab_customers', JSON.stringify(INITIAL_MOCK_CUSTOMERS));
}
if (!localStorage.getItem('hisaab_transactions')) {
  localStorage.setItem('hisaab_transactions', JSON.stringify(INITIAL_MOCK_TRANSACTIONS));
}
if (!localStorage.getItem('hisaab_nudges')) {
  localStorage.setItem('hisaab_nudges', JSON.stringify(INITIAL_MOCK_NUDGES));
}

class ApiClient {
  private useMock = false;
  private accessToken: string | null = null;
  // Gates every request until the first connectivity probe resolves, so a call
  // fired immediately on page load can't race ahead of it and hit a dead
  // backend instead of falling back to the mock (see: zeros-on-first-load bug).
  private ready: Promise<void>;

  constructor() {
    this.ready = this.checkBackendConnection();
  }

  async checkBackendConnection(): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      const data = await res.json();
      if (data.status === 'ok') {
        this.useMock = false;
        console.log('Hisaab AI Backend Connected');
      } else {
        this.useMock = true;
      }
    } catch {
      this.useMock = true;
      console.warn('Hisaab AI Backend Offline. Using Mock Client (LocalStorage).');
    }
  }

  get isOffline() {
    return this.useMock;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    await this.ready;
    if (this.useMock) {
      return JSON.parse(localStorage.getItem('hisaab_customers') || '[]');
    }
    const res = await fetch(`${API_BASE_URL}/customers/`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    await this.ready;
    if (this.useMock) {
      const customers = await this.getCustomers();
      const newCustomer: Customer = {
        ...customer,
        id: 'c-' + Math.random().toString(36).substr(2, 9),
        business_id: MOCK_BUSINESS_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      customers.push(newCustomer);
      localStorage.setItem('hisaab_customers', JSON.stringify(customers));
      return newCustomer;
    }
    const res = await fetch(`${API_BASE_URL}/customers/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(customer)
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  }

  // --- TRANSACTIONS ---
  async getTransactions(): Promise<Transaction[]> {
    await this.ready;
    if (this.useMock) {
      return JSON.parse(localStorage.getItem('hisaab_transactions') || '[]');
    }
    const res = await fetch(`${API_BASE_URL}/transactions/`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    await this.ready;
    if (this.useMock) {
      const transactions = await this.getTransactions();
      const newTransaction: Transaction = {
        ...transaction,
        id: 't-' + Math.random().toString(36).substr(2, 9),
        business_id: MOCK_BUSINESS_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      transactions.push(newTransaction);
      localStorage.setItem('hisaab_transactions', JSON.stringify(transactions));

      // Adjust customer balance
      const customers = await this.getCustomers();
      const updatedCustomers = customers.map(c => {
        if (c.id === transaction.customer_id) {
          const change = transaction.type === 'CREDIT' ? Number(transaction.amount) : -Number(transaction.amount);
          return { ...c, current_balance: c.current_balance + change, updated_at: new Date().toISOString() };
        }
        return c;
      });
      localStorage.setItem('hisaab_customers', JSON.stringify(updatedCustomers));

      return newTransaction;
    }
    const res = await fetch(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  }

  async updateTransaction(
    id: string,
    changes: Partial<Pick<Transaction, 'amount' | 'type' | 'description' | 'status'>>
  ): Promise<Transaction> {
    await this.ready;
    if (this.useMock) {
      const transactions = await this.getTransactions();
      const existing = transactions.find(t => t.id === id);
      if (!existing) throw new Error('Transaction not found');
      const updated: Transaction = { ...existing, ...changes, updated_at: new Date().toISOString() };

      localStorage.setItem(
        'hisaab_transactions',
        JSON.stringify(transactions.map(t => (t.id === id ? updated : t)))
      );

      // Reverse the old amount/type effect and apply the new one, mirroring the
      // real backend's balance trigger (0002_customer_balance_trigger.sql).
      const oldDelta = existing.type === 'CREDIT' ? Number(existing.amount) : -Number(existing.amount);
      const newDelta = updated.type === 'CREDIT' ? Number(updated.amount) : -Number(updated.amount);
      const customers = await this.getCustomers();
      localStorage.setItem(
        'hisaab_customers',
        JSON.stringify(
          customers.map(c =>
            c.id === existing.customer_id
              ? { ...c, current_balance: c.current_balance - oldDelta + newDelta, updated_at: new Date().toISOString() }
              : c
          )
        )
      );

      return updated;
    }
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(changes)
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  }

  // --- RECOVERY NUDGES ---
  async getNudges(): Promise<RecoveryNudge[]> {
    await this.ready;
    if (this.useMock) {
      return JSON.parse(localStorage.getItem('hisaab_nudges') || '[]');
    }
    const res = await fetch(`${API_BASE_URL}/nudges/`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch nudges');
    return res.json();
  }

  async createNudge(nudge: Omit<RecoveryNudge, 'id' | 'created_at' | 'updated_at'>): Promise<RecoveryNudge> {
    await this.ready;
    if (this.useMock) {
      const nudges = await this.getNudges();
      const newNudge: RecoveryNudge = {
        ...nudge,
        id: 'n-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      nudges.push(newNudge);
      localStorage.setItem('hisaab_nudges', JSON.stringify(nudges));
      return newNudge;
    }
    const res = await fetch(`${API_BASE_URL}/nudges/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(nudge)
    });
    if (!res.ok) throw new Error('Failed to create nudge');
    return res.json();
  }

  async sendNudge(nudgeId: string): Promise<RecoveryNudge> {
    await this.ready;
    if (this.useMock) {
      const nudges = await this.getNudges();
      const updated = nudges.map(n => {
        if (n.id === nudgeId) {
          return { ...n, status: 'SENT' as const, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        }
        return n;
      });
      localStorage.setItem('hisaab_nudges', JSON.stringify(updated));
      return updated.find(n => n.id === nudgeId)!;
    }
    const res = await fetch(`${API_BASE_URL}/nudges/${nudgeId}/send`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to send nudge');
    return res.json();
  }
}

export const api = new ApiClient();
