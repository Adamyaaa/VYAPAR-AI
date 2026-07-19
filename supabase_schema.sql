-- Hisaab AI Supabase schema
-- Tables, indexes, triggers, and RLS policies for a WhatsApp-based ledger system.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  business_name text not null,
  phone_number text,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid not null primary key default gen_random_uuid(),
  business_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone_number text,
  current_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid not null primary key default gen_random_uuid(),
  business_id uuid not null references profiles(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  amount numeric(14,2) not null,
  type text not null check (type in ('CREDIT', 'DEBIT')),
  description text,
  voice_url text,
  status text not null default 'PENDING' check (status in ('PENDING', 'CONFIRMED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recovery_nudges (
  id uuid not null primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  message_text text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SENT')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_phone_number on profiles (phone_number);
create index if not exists idx_customers_business_id on customers (business_id);
create index if not exists idx_customers_business_phone on customers (business_id, phone_number);
create index if not exists idx_transactions_business_customer on transactions (business_id, customer_id);
create index if not exists idx_recovery_nudges_transaction_id on recovery_nudges (transaction_id);
create index if not exists idx_recovery_nudges_customer_id on recovery_nudges (customer_id);

create or replace function set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row
  execute function set_updated_at();

create trigger customers_set_updated_at
  before update on customers
  for each row
  execute function set_updated_at();

create trigger transactions_set_updated_at
  before update on transactions
  for each row
  execute function set_updated_at();

create trigger recovery_nudges_set_updated_at
  before update on recovery_nudges
  for each row
  execute function set_updated_at();

alter table profiles enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;
alter table recovery_nudges enable row level security;

create policy "Profiles: authenticated user can access own profile"
  on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Customers: business owner can manage own customers"
  on customers
  for all
  using (business_id = auth.uid())
  with check (business_id = auth.uid());

create policy "Transactions: business owner can manage own transactions"
  on transactions
  for all
  using (business_id = auth.uid())
  with check (business_id = auth.uid());

create policy "Recovery nudges: business owner can manage own nudges"
  on recovery_nudges
  for all
  using (
    exists (
      select 1
      from transactions
      where transactions.id = recovery_nudges.transaction_id
        and transactions.business_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from transactions
      where transactions.id = new.transaction_id
        and transactions.business_id = auth.uid()
    )
    and exists (
      select 1
      from customers
      where customers.id = new.customer_id
        and customers.business_id = auth.uid()
    )
  );
