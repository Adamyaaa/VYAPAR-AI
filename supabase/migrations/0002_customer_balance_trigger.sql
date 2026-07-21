-- Keeps customers.current_balance in sync with transactions automatically.
-- Previously nothing recalculated it on the real backend (only the frontend's
-- offline/localStorage mock did the math) — every transaction insert/update/
-- delete now adjusts the affected customer's balance by the correct delta.
-- security definer avoids any RLS edge cases on the cross-table update; the
-- customer being touched always belongs to the same business as the
-- transaction (enforced at the API layer before insert), so this doesn't
-- widen access — it just guarantees the invariant holds regardless of caller.
create or replace function apply_transaction_to_balance()
  returns trigger
  language plpgsql
  security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update customers
    set current_balance = current_balance + (case when new.type = 'CREDIT' then new.amount else -new.amount end)
    where id = new.customer_id;
    return new;
  elsif (tg_op = 'UPDATE') then
    if (old.customer_id = new.customer_id) then
      update customers
      set current_balance = current_balance
        - (case when old.type = 'CREDIT' then old.amount else -old.amount end)
        + (case when new.type = 'CREDIT' then new.amount else -new.amount end)
      where id = new.customer_id;
    else
      update customers
      set current_balance = current_balance - (case when old.type = 'CREDIT' then old.amount else -old.amount end)
      where id = old.customer_id;
      update customers
      set current_balance = current_balance + (case when new.type = 'CREDIT' then new.amount else -new.amount end)
      where id = new.customer_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    update customers
    set current_balance = current_balance - (case when old.type = 'CREDIT' then old.amount else -old.amount end)
    where id = old.customer_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists transactions_apply_balance on transactions;
create trigger transactions_apply_balance
  after insert or update or delete on transactions
  for each row
  execute function apply_transaction_to_balance();
