# Database migrations

This project has no Supabase service-role key or DB password wired into any
tool, so migrations are applied by hand via the Supabase Dashboard's SQL
Editor — there's no automated `supabase db push` in this workflow (yet).

**Convention:** each schema change after the baseline is its own numbered
file here (`000X_description.sql`), applied **once**, in order, and never
edited after being applied to production. `../../supabase_schema.sql` at the
repo root is a consolidated snapshot of everything below combined — the file
to paste in full when setting up a brand-new environment. Existing
environments should apply only the new migration file(s) they haven't run
yet, not re-paste the whole snapshot (that's what caused the repeated
`already exists` errors before every statement had `drop ... if exists`
guards).

| File | Applied | Summary |
|---|---|---|
| `0001_init.sql` | yes | Tables, indexes, RLS, `handle_new_user` signup trigger |
| `0002_customer_balance_trigger.sql` | pending | Auto-recalculates `customers.current_balance` from transactions |
