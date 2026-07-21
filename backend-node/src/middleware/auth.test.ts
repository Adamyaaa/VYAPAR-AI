import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

const { mockGetUser, mockCreateClient } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockCreateClient = vi.fn(() => ({ auth: { getUser: mockGetUser }, from: vi.fn() }));
  return { mockGetUser, mockCreateClient };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: { auth: { getUser: mockGetUser } },
}));

import { requireAuth } from './auth';

function makeReq(authHeader?: string): Request {
  return { header: (name: string) => (name.toLowerCase() === 'authorization' ? authHeader : undefined) } as unknown as Request;
}

describe('requireAuth', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
  });

  it('rejects requests with no Authorization header', async () => {
    const next = vi.fn();
    await requireAuth(makeReq(undefined), {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejects a header that is not a Bearer token', async () => {
    const next = vi.fn();
    await requireAuth(makeReq('Basic abc123'), {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejects an invalid/expired token', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } });
    const next = vi.fn();
    await requireAuth(makeReq('Bearer bad-token'), {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('attaches userId and userSupabase for a valid token, then calls next with no error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    const next = vi.fn();
    const req = makeReq('Bearer good-token');
    await requireAuth(req, {} as Response, next as NextFunction);

    expect(req.userId).toBe('user-123');
    expect(req.userSupabase).toBeDefined();
    expect(next).toHaveBeenCalledWith();
  });
});
