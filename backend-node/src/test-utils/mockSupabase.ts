import { vi } from 'vitest';

export interface MockResult {
  data: unknown;
  error: { message: string } | null;
  count?: number;
}

/**
 * A minimal stand-in for a Supabase query builder: every chain method
 * (select/eq/order/range/insert/update) returns itself, and the builder is
 * awaitable (implements `.then`), resolving to whatever result you configure —
 * mirroring how supabase-js builders are thenable promises under the hood.
 */
export function createMockQueryBuilder(result: MockResult) {
  const builder: Record<string, unknown> = {};
  const chainMethods = ['select', 'eq', 'order', 'range', 'insert', 'update'];
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (onFulfilled: (value: MockResult) => unknown, onRejected?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}

export interface MockSupabaseClient {
  auth: { getUser: ReturnType<typeof vi.fn> };
  from: ReturnType<typeof vi.fn>;
}

export function createMockSupabaseClient(): MockSupabaseClient {
  return {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  };
}
