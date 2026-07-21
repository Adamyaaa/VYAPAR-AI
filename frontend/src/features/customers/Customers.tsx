import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button, SearchInput, FilterBar, Skeleton, type FilterOption } from '../../components/ui';
import { useCustomersData, type CustomerFilter } from './useCustomersData';
import { CustomerTable } from './CustomerTable';
import { AddCustomerModal } from './AddCustomerModal';

const FILTERS: FilterOption<CustomerFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'vip', label: 'VIP' },
  { value: 'at-risk', label: 'At risk' },
];

export const Customers: React.FC = () => {
  const { loading, customers, counts, search, setSearch, filter, setFilter, reload } = useCustomersData();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone…" className="sm:max-w-xs" />
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} />
          Add customer
        </Button>
      </div>

      <FilterBar
        options={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
        active={filter}
        onChange={setFilter}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <CustomerTable customers={customers} hasAnyCustomers={counts.all > 0} />
      )}

      <AddCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={reload} />
    </div>
  );
};
