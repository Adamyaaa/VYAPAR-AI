import React from 'react';
import { Users } from 'lucide-react';
import { Card, EmptyState } from '../../components/ui';
import { CustomerRow } from './CustomerRow';
import type { EnrichedCustomer } from './useCustomersData';

interface CustomerTableProps {
  customers: EnrichedCustomer[];
  hasAnyCustomers: boolean;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ customers, hasAnyCustomers }) => {
  if (customers.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title={hasAnyCustomers ? 'No customers match this view' : 'No customers yet'}
          description={hasAnyCustomers ? 'Try a different search or filter.' : 'Add your first customer to start a ledger.'}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden md:flex items-center gap-4 px-4 py-2.5 border-b border-border-soft text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
        <span className="w-9" />
        <span className="flex-1">Customer</span>
        <span className="w-[104px]">Risk</span>
        <span className="w-24 text-right">Reliability</span>
        <span className="w-28 text-right">Balance</span>
        <span className="w-4" />
      </div>
      {customers.map((c) => (
        <CustomerRow key={c.id} customer={c} />
      ))}
    </Card>
  );
};
