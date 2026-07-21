# Hisaab AI Backend API Reference

Base URL (local dev): `http://localhost:8000`

## Authentication

Every route except the health checks requires a Supabase Auth session.
Sign up / sign in happens client-side against Supabase directly (see the
frontend's `AuthContext`); this backend only **verifies** the resulting JWT.

```
Authorization: Bearer <supabase-access-token>
```

Requests without a valid, non-expired token get `401`. Every query the
backend runs on your behalf is scoped to that token via Postgres Row-Level
Security — you can only ever see or modify rows where `business_id` (or the
equivalent relationship) matches your own user id. There is no service-role
bypass anywhere in this backend.

## Pagination

All list (`GET`) endpoints accept:

| Param | Default | Max | Notes |
|---|---|---|---|
| `limit` | 50 | 200 | Rows per page |
| `offset` | 0 | — | Rows to skip |

The response body stays a plain JSON array (unchanged shape); the total
matching row count (ignoring `limit`/`offset`) is returned in the
`X-Total-Count` response header.

```
GET /customers/?limit=20&offset=40
X-Total-Count: 137
```

## Errors

All errors are `{ "detail": string | object }`. Validation errors (`422`)
return `detail` as an array of Zod issue objects (field path + message).

| Status | Meaning |
|---|---|
| 401 | Missing/invalid/expired bearer token |
| 403 | Authenticated, but not the owner of the referenced resource |
| 404 | Not found (or not yours — same response, to avoid leaking existence) |
| 422 | Request body/query failed validation |
| 502 | The configured Supabase project rejected or failed the query |
| 503 | `/health/db` only — Supabase project unreachable |

## Health

| Route | Auth | Purpose |
|---|---|---|
| `GET /` | none | Legacy health check (used by the frontend's offline/demo-mode detection) |
| `GET /health` | none | Liveness — is the process serving requests |
| `GET /health/db` | none | Readiness — is the configured Supabase project actually reachable |

## Customers

### `GET /customers/`
List the caller's customers, ordered by name. Paginated (see above).

### `POST /customers/`
```json
{ "name": "string (required)", "phone_number": "string | null", "current_balance": "number, default 0" }
```
`current_balance` here is an **opening balance** at customer creation —
ongoing balance changes come from transactions (see the balance trigger,
`supabase/migrations/0002_customer_balance_trigger.sql`), not from editing
this field directly.

## Transactions

### `GET /transactions/`
List the caller's transactions, newest first. Paginated.

### `POST /transactions/`
```json
{
  "customer_id": "uuid (required)",
  "amount": "number, 2dp max (required)",
  "type": "CREDIT | DEBIT (required)",
  "description": "string | null",
  "voice_url": "string | null",
  "status": "PENDING | CONFIRMED, default PENDING"
}
```
The referenced `customer_id` must belong to the caller's own business — this
is checked explicitly at the API layer (not just via RLS on `transactions`,
since RLS there only guarantees `business_id` is your own, not that the
customer you're pointing at is).

Creating a transaction automatically adjusts the customer's
`current_balance` via a database trigger — the API response reflects the
transaction record itself, not the updated customer; re-fetch the customer
if you need the new balance.

## Recovery nudges

### `GET /nudges/`
List nudges for transactions belonging to the caller. Paginated.

### `POST /nudges/`
```json
{ "transaction_id": "uuid (required)", "customer_id": "uuid (required)", "message_text": "string (required)", "status": "DRAFT | SENT, default DRAFT" }
```
`customer_id` ownership is verified the same way as transactions.

### `POST /nudges/:nudgeId/send`
Marks a nudge `SENT` and stamps `sent_at`. Does not itself deliver a message
anywhere yet — see Phase 4 (WhatsApp Cloud API integration) in the project
roadmap; today the frontend opens a `wa.me` link after this call succeeds.

## Rate limiting

All routes share a limiter: `300` requests per `15` minutes per IP by
default, configurable via `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`. Standard
`RateLimit-*` response headers are included.

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_ANON_KEY` (or `SUPABASE_KEY`) | yes | Anon key — RLS is always enforced, never a service-role key |
| `PORT` | no (default `8000`) | Listen port |
| `NODE_ENV` | no (default `development`) | Toggles morgan's log format |
| `CORS_ORIGINS` | no | Comma-separated allowed origins; falls back to local Vite dev ports |
| `RATE_LIMIT_WINDOW_MS` | no (default `900000`) | Rate limit window |
| `RATE_LIMIT_MAX` | no (default `300`) | Max requests per window per IP |
