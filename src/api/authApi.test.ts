import { describe, expect, it, vi } from 'vitest';
import { authApi } from '@/api/authApi';
import { apiClient } from '@/api/client';

vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('authApi.login', () => {
  it('reads lowercase token field', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { token: 'abc' } });

    const token = await authApi.login({ email: 'a@b.com', password: 'secret123' });

    expect(token).toBe('abc');
  });

  it('reads uppercase Token field', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { Token: 'xyz' } });

    const token = await authApi.login({ email: 'a@b.com', password: 'secret123' });

    expect(token).toBe('xyz');
  });
});
