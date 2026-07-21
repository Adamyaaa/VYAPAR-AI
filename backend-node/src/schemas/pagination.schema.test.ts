import { describe, it, expect } from 'vitest';
import { PaginationQuery } from './pagination.schema';

describe('PaginationQuery', () => {
  it('defaults limit to 50 and offset to 0 when omitted', () => {
    const result = PaginationQuery.parse({});
    expect(result).toEqual({ limit: 50, offset: 0 });
  });

  it('coerces string query params to numbers', () => {
    const result = PaginationQuery.parse({ limit: '10', offset: '20' });
    expect(result).toEqual({ limit: 10, offset: 20 });
  });

  it('rejects a limit above the max', () => {
    expect(() => PaginationQuery.parse({ limit: '500' })).toThrow();
  });

  it('rejects a negative offset', () => {
    expect(() => PaginationQuery.parse({ offset: '-1' })).toThrow();
  });

  it('rejects a limit of 0', () => {
    expect(() => PaginationQuery.parse({ limit: '0' })).toThrow();
  });
});
