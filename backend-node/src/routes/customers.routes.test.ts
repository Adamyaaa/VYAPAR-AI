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

describe('GET /customers/', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/customers/');
    expect(res.status).toBe(401);
  });

  it('returns customers with a total-count header when authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER }, error: null });
    mockFrom.mockReturnValue(
      createMockQueryBuilder({
        data: [{ id: 'c1', name: 'Rajesh', business_id: AUTHED_USER.id, current_balance: 100 }],
        error: null,
        count: 1,
      })
    );

    const res = await request(app).get('/customers/').set('Authorization', 'Bearer good-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.headers['x-total-count']).toBe('1');
  });

  it('propagates a Supabase error as 502', async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER }, error: null });
    mockFrom.mockReturnValue(createMockQueryBuilder({ data: null, error: { message: 'connection refused' } }));

    const res = await request(app).get('/customers/').set('Authorization', 'Bearer good-token');

    expect(res.status).toBe(502);
  });
});

describe('POST /customers/', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  it('returns 422 when the body is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER }, error: null });

    const res = await request(app)
      .post('/customers/')
      .set('Authorization', 'Bearer good-token')
      .send({ phone_number: '+911234567890' }); // missing required `name`

    expect(res.status).toBe(422);
  });

  it('creates a customer and returns 201', async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER }, error: null });
    mockFrom.mockReturnValue(
      createMockQueryBuilder({
        data: { id: 'c2', name: 'Priya', business_id: AUTHED_USER.id, current_balance: 0 },
        error: null,
      })
    );

    const res = await request(app)
      .post('/customers/')
      .set('Authorization', 'Bearer good-token')
      .send({ name: 'Priya' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Priya');
  });
});
