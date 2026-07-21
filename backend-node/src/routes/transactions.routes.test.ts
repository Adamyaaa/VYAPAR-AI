import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createMockQueryBuilder } from '../test-utils/mockSupabase';

const { mockGetUser, mockFrom, mockClient } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockFrom = vi.fn();
  return { mockGetUser, mockFrom, mockClient: { auth: { getUser: mockGetUser }, from: mockFrom } };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockClient),
}));

import { app } from '../app';

const AUTHED_USER = { id: 'business-123' };

describe('PATCH /transactions/:transactionId', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER }, error: null });
  });

  it('returns 422 when the body is empty', async () => {
    const res = await request(app)
      .patch('/transactions/tx-1')
      .set('Authorization', 'Bearer good-token')
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 404 when the transaction does not exist or is not owned by the caller', async () => {
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: { message: 'no rows' } }));

    const res = await request(app)
      .patch('/transactions/tx-1')
      .set('Authorization', 'Bearer good-token')
      .send({ description: 'Corrected note' });

    expect(res.status).toBe(404);
  });

  it('updates and returns the transaction on success', async () => {
    mockFrom.mockReturnValue(
      createMockQueryBuilder({
        data: { id: 'tx-1', description: 'Corrected note', business_id: AUTHED_USER.id },
        error: null,
      })
    );

    const res = await request(app)
      .patch('/transactions/tx-1')
      .set('Authorization', 'Bearer good-token')
      .send({ description: 'Corrected note' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Corrected note');
  });
});
